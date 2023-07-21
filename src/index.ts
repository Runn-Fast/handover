import Bolt from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import * as dateFns from 'date-fns'
import { errorListBoundary } from '@stayradiated/error-boundary'
import { createUserFetcher } from './create-user-fetcher.js'
import type { UserFetcher } from './create-user-fetcher.js'
import { listenToMessage } from './listen-to-message.js'
import type { Message, Context } from './types.js'
import { mapMessageToAction } from './map-message-to-action.js'
import { formatPostAsText } from './format-post-as-text.js'
import {
  publishPublicContentToSlack,
  publishPrivateContentToSlack,
} from './publish-to-slack.js'
import { getDateFromTs, getDateFromMessage } from './date-utils.js'
import { checkAndRemindUsers } from './remind-user.js'
import {
  SLACK_BOT_TOKEN,
  SLACK_APP_TOKEN,
  HANDOVER_CHANNEL,
  HANDOVER_TITLE,
  PORT,
  SLACK_SIGNING_SECRET,
} from './constants.js'
import * as db from './db/index.js'
import { isCommand, execCommand } from './command/index.js'
import { getFormatFnList } from './format.js'

type AddHeadingOptions = {
  web: WebClient
  date: string
}

const addHeading = async (
  options: AddHeadingOptions,
): Promise<void | Error> => {
  const { web, date } = options

  const heading = await db.upsertHeading({
    date,
    title: `:sstar: *${HANDOVER_TITLE} ∙ ${dateFns.format(
      dateFns.parseISO(date),
      'PPPP',
    )}*`,
  })
  if (heading instanceof Error) {
    return heading
  }

  if (!heading.ts) {
    const headingTs = await publishPublicContentToSlack({
      web,
      channel: HANDOVER_CHANNEL,
      ts: undefined,
      text: heading.title,
    })
    if (headingTs instanceof Error) {
      return headingTs
    }

    const updateHeadingResult = await db.updateHeading(heading.id, {
      channel: HANDOVER_CHANNEL,
      ts: headingTs,
    })
    if (updateHeadingResult instanceof Error) {
      return updateHeadingResult
    }

    const userList = await db.getActiveUserList({
      activeSince: dateFns.subDays(dateFns.parseISO(date), 7),
    })
    if (userList instanceof Error) {
      return userList
    }

    const bulkUpdateResult = await errorListBoundary(async () =>
      Promise.all(
        userList.map(async (user): Promise<void | Error> => {
          const upsertPostResult = await db.upsertPost({
            userId: user.id,
            title: user.name,
            date,
          })
          if (upsertPostResult instanceof Error) {
            return upsertPostResult
          }

          const updateUserResult = await updateUserPost({
            web,
            userId: user.id,
            date,
          })
          if (updateUserResult instanceof Error) {
            return updateUserResult
          }
        }),
      ),
    )
    if (bulkUpdateResult instanceof Error) {
      return bulkUpdateResult
    }
  }
}

type UpdateHandoverOptions = {
  web: WebClient
  userId: string
  date: string
}

const updateUserPost = async (
  options: UpdateHandoverOptions,
): Promise<void | Error> => {
  const { web, userId, date } = options

  const post = await db.getPostWithItems({
    userId,
    date,
  })
  if (!post) {
    return new Error('Could not find with post with items')
  }

  if (post instanceof Error) {
    return post
  }

  const formatFnList = await getFormatFnList()

  const text = formatPostAsText({ post, formatFnList })
  const ts = post.ts ?? undefined

  const publishedTs = await publishPublicContentToSlack({
    web,
    channel: HANDOVER_CHANNEL,
    ts,
    text,
  })
  if (publishedTs instanceof Error) {
    return publishedTs
  }

  const updatePostResult = await db.updatePost(post.id, {
    channel: HANDOVER_CHANNEL,
    ts: publishedTs,
  })
  if (updatePostResult instanceof Error) {
    return updatePostResult
  }
}

type AddPostItemOptions = {
  web: WebClient
  userId: string
  postTitle: string
  postDate: string
  channel: string
  ts: string
  text: string
}
const addPostItem = async (
  options: AddPostItemOptions,
): Promise<void | Error> => {
  const { web, userId, postTitle, postDate, channel, ts, text } = options
  const post = await db.upsertPost({
    userId,
    title: postTitle,
    date: postDate,
  })
  if (post instanceof Error) {
    return post
  }

  const postItem = await db.upsertPostItem({
    postId: post.id,
    channel,
    ts,
    text,
  })
  if (postItem instanceof Error) {
    return postItem
  }

  const addHeadingResult = await addHeading({ web, date: postDate })
  if (addHeadingResult instanceof Error) {
    return addHeadingResult
  }

  if (postItem.before && postItem.before?.postId !== postItem.after.postId) {
    // If the postItem was moved from one date to another, we need to update
    // the original post -- otherwise it will be listed twice in the handover

    const originalPost = await db.getPost({
      id: postItem.before.postId,
    })
    if (originalPost instanceof Error) {
      return originalPost
    }

    const updateOriginalPostResult = await updateUserPost({
      web,
      userId,
      date: originalPost.date.toISOString(),
    })
    if (updateOriginalPostResult instanceof Error) {
      return updateOriginalPostResult
    }
  }

  const updateUserPostResult = await updateUserPost({
    web,
    userId,
    date: postDate,
  })
  if (updateUserPostResult instanceof Error) {
    return updateUserPostResult
  }
}

type DeletePostItemOptions = {
  web: WebClient
  userId: string
  postDate: string
  channel: string
  ts: string
}
const deletePostItem = async (
  options: DeletePostItemOptions,
): Promise<void | Error> => {
  const { web, userId, postDate, channel, ts } = options
  const deletePostItemResult = await db.deletePostItem({
    channel,
    ts,
  })
  if (deletePostItemResult instanceof Error) {
    return deletePostItemResult
  }

  const addHeadingResult = await addHeading({ web, date: postDate })
  if (addHeadingResult instanceof Error) {
    return addHeadingResult
  }

  const updateUserPostResult = await updateUserPost({
    web,
    userId,
    date: postDate,
  })
  if (updateUserPostResult instanceof Error) {
    return updateUserPostResult
  }
}

type CreateMessageHandlerOptions = {
  fetchUser: UserFetcher
  web: WebClient
}

const createMessageHandler = (options: CreateMessageHandlerOptions) => {
  const { fetchUser, web } = options

  const handleMessage = async (
    message: Message,
    context: Context,
  ): Promise<void | Error> => {
    const action = mapMessageToAction(message)
    if (action instanceof Error) {
      return action
    }

    const user = await fetchUser(action.userId)
    if (user instanceof Error) {
      return user
    }

    if (
      context.botUserId &&
      action.type === 'ADD' &&
      isCommand({
        botUserId: context.botUserId,
        text: action.text,
      })
    ) {
      await execCommand({ action, web })
      return
    }

    const actionDate = getDateFromTs({
      ts: action.ts,
      timeZone: user.timeZone,
      dayStartsAtHour: 0,
    })

    const messageDate = getDateFromMessage({
      messageText: action.text,
      ts: action.ts,
      timeZone: user.timeZone,
    })
    if (messageDate instanceof Error) {
      await publishPrivateContentToSlack({
        web,
        userId: action.userId,
        text: messageDate.message,
      })
      return
    }

    const date = messageDate ?? actionDate

    console.log(user.name, date.split('T')[0])

    if (action.type === 'ADD' || action.type === 'CHANGE') {
      const addPostItemResult = await addPostItem({
        web,
        userId: action.userId,
        postTitle: user.name,
        postDate: date,
        channel: action.channel,
        ts: action.ts,
        text: action.text,
      })
      if (addPostItemResult instanceof Error) {
        return addPostItemResult
      }
    } else if (action.type === 'REMOVE') {
      const deletePostItemResult = await deletePostItem({
        web,
        userId: action.userId,
        postDate: date,
        channel: action.channel,
        ts: action.ts,
      })
      if (deletePostItemResult instanceof Error) {
        return deletePostItemResult
      }
    }
  }

  return handleMessage
}

const start = async () => {
  const web = new WebClient(SLACK_BOT_TOKEN)

  const fetchUser = createUserFetcher(web)

  const userList = await db.getUserList()
  if (userList instanceof Error) {
    console.error(
      new Error('Could not fetch user list from database', {
        cause: userList,
      }),
    )
    return
  }

  await Promise.all(
    userList.map(async (user) => {
      const fetchUserResult = await fetchUser(user.id)
      if (fetchUserResult instanceof Error) {
        console.error(
          new Error(`Could not fetch info for user ${user.id}`, {
            cause: fetchUserResult,
          }),
        )
      }
    }),
  )

  const slackBoltApp = new Bolt.App({
    port: PORT,
    signingSecret: SLACK_SIGNING_SECRET,
    token: SLACK_BOT_TOKEN,
    socketMode: true,
    appToken: SLACK_APP_TOKEN,
    customRoutes: [
      {
        path: '/',
        method: ['GET'],
        handler(_request, response) {
          response.end('BEEP BOOP. I AM HANDOVER BOT.')
        },
      },
    ],
  })

  const handleMessage = createMessageHandler({
    fetchUser,
    web,
  })

  console.log('Connecting to slack…')

  await listenToMessage(slackBoltApp, async (message, context) => {
    const result = await handleMessage(message, context)
    if (result instanceof Error) {
      console.error(result)
    }
  })

  console.info('Connected! Listening to slack messages…')

  // Check if there are any users who need reminding to send their handover.
  setInterval(async () => {
    const result = await checkAndRemindUsers({ web })
    if (result instanceof Error) {
      console.error(result)
    }
  }, 60 * 1000)
}

try {
  await start()
} catch (error) {
  console.error(error)
}

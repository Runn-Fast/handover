import type { WebClient } from '@slack/web-api'
import * as dateFns from 'date-fns'
import { errorListBoundary } from '@stayradiated/error-boundary'
import { formatPostAsText } from './format-post-as-text.js'
import { publishPublicContentToSlack } from './publish-to-slack.js'
import { HANDOVER_CHANNEL, HANDOVER_TITLE } from './constants.js'
import * as db from './db/index.js'
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
    title: `:star: *${HANDOVER_TITLE} ∙ ${dateFns.format(
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
      startDate: dateFns.subDays(dateFns.parseISO(date), 7),
      endDate: dateFns.endOfDay(dateFns.parseISO(date)),
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
            date: dateFns.parseISO(date),
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
    date: dateFns.parseISO(date),
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
export const addPostItem = async (
  options: AddPostItemOptions,
): Promise<void | Error> => {
  const { web, userId, postTitle, postDate, channel, ts, text } = options
  const post = await db.upsertPost({
    userId,
    title: postTitle,
    date: dateFns.parseISO(postDate),
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
export const deletePostItem = async (
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

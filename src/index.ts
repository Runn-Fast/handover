import Bolt from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import * as dateFns from 'date-fns'

import createUserFetcher from './create-user-fetcher.js'
import { listenToMessage } from './listen-to-message.js'
import { mapMessageToAction } from './map-message-to-action.js'
import { formatPostAsText } from './format-post-as-text.js'
import {
  publishPublicContentToSlack,
  publishPrivateContentToSlack,
} from './publish-to-slack.js'
import {
  getDateFromTs,
  formatDateAsISODate,
  formatDateAsTime,
} from './date-utils.js'
import { generateReminder } from './ai.js'

import {
  SLACK_BOT_TOKEN,
  SLACK_APP_TOKEN,
  HANDOVER_CHANNEL,
  HANDOVER_TITLE,
  PORT,
  SLACK_SIGNING_SECRET,
} from './constants.js'

import * as db from './db.js'

type AddHeadingOptions = {
  web: WebClient
  date: string
}

const addHeading = async (options: AddHeadingOptions) => {
  const { web, date } = options

  const heading = await db.upsertHeading({
    date,
    title: `:star: *${HANDOVER_TITLE} ∙ ${dateFns.format(
      dateFns.parseISO(date),
      'PPPP',
    )}*`,
  })
  if (!heading.ts) {
    const headingTs = await publishPublicContentToSlack({
      web,
      channel: HANDOVER_CHANNEL,
      ts: undefined,
      text: heading.title,
    })
    await db.updateHeading(heading.id, {
      channel: HANDOVER_CHANNEL,
      ts: headingTs,
    })

    const userList = await db.getActiveUserList({
      activeSince: dateFns.subDays(dateFns.parseISO(date), 7),
    })
    for (const user of userList) {
      await db.addPost({
        userId: user.id,
        title: user.name,
        date,
      })
      await updateUserPost({ web, userId: user.id, date })
    }
  }
}

type UpdateHandoverOptions = {
  web: WebClient
  userId: string
  date: string
}

const updateUserPost = async (options: UpdateHandoverOptions) => {
  const { web, userId, date } = options

  const post = await db.getPostWithItems({
    userId,
    date,
  })
  if (!post) {
    throw new Error('Could not find with post with items')
  }

  const text = formatPostAsText(post)
  const ts = post.ts ?? undefined

  const publishedTs = await publishPublicContentToSlack({
    web,
    channel: HANDOVER_CHANNEL,
    ts,
    text,
  })

  await db.updatePost(post.id, {
    channel: HANDOVER_CHANNEL,
    ts: publishedTs,
  })
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
const addPostItem = async (options: AddPostItemOptions) => {
  const { web, userId, postTitle, postDate, channel, ts, text } = options
  const post = await db.addPost({
    userId,
    title: postTitle,
    date: postDate,
  })
  await db.addPostItem({
    postId: post.id,
    channel,
    ts,
    text,
  })
  await addHeading({ web, date: postDate })
  await updateUserPost({ web, userId, date: postDate })
}

type DeletePostItemOptions = {
  web: WebClient
  userId: string
  postDate: string
  channel: string
  ts: string
}
const deletePostItem = async (options: DeletePostItemOptions) => {
  const { web, userId, postDate, channel, ts } = options
  await db.deletePostItem({
    channel,
    ts,
  })
  await addHeading({ web, date: postDate })
  await updateUserPost({ web, userId, date: postDate })
}

type RemindUsersOptions = {
  web: WebClient
}
const remindUsers = async (options: RemindUsersOptions) => {
  const { web } = options
  const now = new Date()
  const userList = await db.getActiveUserList({
    activeSince: dateFns.subDays(now, 7),
  })
  for (const user of userList) {
    const userTime = formatDateAsTime({ date: now, timeZone: user.timeZone })
    const userDate = formatDateAsISODate({ date: now, timeZone: user.timeZone })
    const isWeekend = dateFns.isWeekend(dateFns.parseISO(userDate))

    if (userTime >= '17:00' && !isWeekend) {
      const post = await db.getPostWithItems({
        userId: user.id,
        date: userDate,
      })
      if (!post || post.items.length === 0) {
        const reminderText = await generateReminder({ name: user.name })

        const reminder = await db.upsertReminder({
          userId: user.id,
          date: userDate,
          text: reminderText,
        })

        if (!reminder.ts) {
          const messageTs = await publishPrivateContentToSlack({
            web,
            userId: reminder.userId,
            text: reminder.text,
          })
          await db.updateReminder(reminder.id, {
            channel: reminder.userId,
            ts: messageTs,
          })
        }
      }
    }
  }
}

const start = async () => {
  const web = new WebClient(SLACK_BOT_TOKEN)

  const fetchUser = createUserFetcher(web)

  {
    const userList = await db.getUserList()
    for (const user of userList) {
      await fetchUser(user.id)
    }
  }

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
        handler(_request, res) {
          res.end('BEEP BOOP. I AM HANDOVER BOT.')
        },
      },
    ],
  })

  await listenToMessage(slackBoltApp, async (message) => {
    console.log(message)
    const action = mapMessageToAction(message)
    console.log(action)

    const user = await fetchUser(action.userId)
    const date = getDateFromTs({ ts: action.ts, timeZone: user.timeZone })
    console.log(user.name, date.split('T')[0])

    if (action.type === 'ADD' || action.type === 'CHANGE') {
      await addPostItem({
        web,
        userId: action.userId,
        postTitle: user.name,
        postDate: date,
        channel: action.channel,
        ts: action.ts,
        text: action.text,
      })
    } else if (action.type === 'REMOVE') {
      await deletePostItem({
        web,
        userId: action.userId,
        postDate: date,
        channel: action.channel,
        ts: action.ts,
      })
    }
  })

  console.info(`Listening to slack messages...`)

  setInterval(async () => {
    try {
      await remindUsers({ web })
    } catch (error) {
      console.error(error)
    }
  }, 60 * 1000)
}

start().catch(console.error)

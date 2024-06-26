import Bolt from '@slack/bolt'
import { WebClient } from '@slack/web-api'
import { createUserFetcher, type UserFetcher } from './create-user-fetcher.js'
import { listenToMessage } from './listen-to-message.js'
import type { Message, Context } from './types.js'
import { mapMessageToAction } from './map-message-to-action.js'
import { publishPrivateContentToSlack } from './publish-to-slack.js'
import { getDateFromTs } from './date-utils.js'
import { parseDateFromMessage } from './parse-date-from-message.js'
import { checkAndRemindUsers } from './lib/remind/index.js'
import {
  SLACK_BOT_TOKEN,
  SLACK_APP_TOKEN,
  PORT,
  SLACK_SIGNING_SECRET,
  HANDOVER_DAILY_REMINDER_TIME,
} from './constants.js'
import * as db from './db/index.js'
import { isCommand, execCommand } from './command/index.js'
import { addPostItem, deletePostItem } from './actions.js'

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

    const messageDateResult = parseDateFromMessage({
      messageText: action.text,
      ts: action.ts,
      timeZone: user.timeZone,
    })
    if (messageDateResult instanceof Error) {
      await publishPrivateContentToSlack({
        web,
        userId: action.userId,
        text: messageDateResult.message,
      })
      return
    }

    const messageDate =
      messageDateResult.type === 'NO_MATCH'
        ? actionDate
        : messageDateResult.date

    const messageText =
      messageDateResult.type === 'NO_MATCH'
        ? action.text
        : messageDateResult.message

    console.log(user.name, messageDate.split('T')[0], messageText)

    if (action.type === 'ADD' || action.type === 'CHANGE') {
      const addPostItemResult = await addPostItem({
        web,
        userId: action.userId,
        postTitle: user.name,
        postDate: messageDate,
        channel: action.channel,
        ts: action.ts,
        text: messageText,
      })
      if (addPostItemResult instanceof Error) {
        return addPostItemResult
      }
    } else if (action.type === 'REMOVE') {
      const deletePostItemResult = await deletePostItem({
        web,
        userId: action.userId,
        postDate: messageDate,
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
    const result = await checkAndRemindUsers({
      web,
      defaultDailyReminderTime: HANDOVER_DAILY_REMINDER_TIME,
      daysSinceLastPostCutOff: 7,
    })
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

import type { WebClient } from '@slack/web-api'
import * as dateFns from 'date-fns'
import type { User, Post } from '@prisma/client'
import { errorListBoundary } from '@stayradiated/error-boundary'
import { publishPrivateContentToSlack } from './publish-to-slack.js'
import { formatDateAsISODate, formatDateAsTime } from './date-utils.js'
import { generateReminder } from './ai.js'
import * as db from './db/index.js'
import { HANDOVER_DAILY_REMINDER_TIME } from './constants.js'

const DAYS_SINCE_LAST_POST_CUT_OFF = 7

const getLatestPost = <P extends Pick<Post, 'date'>>(
  posts: readonly P[],
): P | undefined => {
  if (posts.length === 0) {
    return undefined
  }

  // Sort posts by date descending
  const sortedPosts = [...posts].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  )
  return sortedPosts[0]
}

type SendReminderToUserOptions = {
  web: WebClient
  user: User & { posts: Post[] }
  userDate: string
}

const sendReminderToUser = async (
  options: SendReminderToUserOptions,
): Promise<void | Error> => {
  const { web, user, userDate } = options

  const dateOfLastPostUTC = getLatestPost(user.posts)?.date.getTime()

  const daysSinceLastPost = dateOfLastPostUTC
    ? dateFns.differenceInDays(
        dateFns.parseISO(userDate),
        dateFns.parseISO(
          formatDateAsISODate({
            instant: dateOfLastPostUTC,
            timeZone: user.timeZone,
          }),
        ),
      )
    : Number.POSITIVE_INFINITY

  let reminderText = await generateReminder({
    name: user.name,
    daysSinceLastPost,
  })

  if (daysSinceLastPost >= DAYS_SINCE_LAST_POST_CUT_OFF) {
    reminderText += `\n_It has been ${daysSinceLastPost} days since your last handover post. If you do not post a handover today this will be the last reminder you receive._`
  }

  const messageTs = await publishPrivateContentToSlack({
    web,
    userId: user.id,
    text: reminderText,
  })
  if (messageTs instanceof Error) {
    return messageTs
  }

  const upsertReminderResult = await db.upsertReminder({
    userId: user.id,
    date: userDate,
    text: reminderText,
    channel: user.id,
    ts: messageTs,
  })
  if (upsertReminderResult instanceof Error) {
    return upsertReminderResult
  }
}

type CheckAndRemindUsersOptions = {
  web: WebClient
}
const checkAndRemindUsers = async (
  options: CheckAndRemindUsersOptions,
): Promise<void | Error> => {
  const { web } = options
  const instant = Date.now()
  const userList = await db.getActiveUserList({
    activeSince: dateFns.subDays(instant, DAYS_SINCE_LAST_POST_CUT_OFF),
  })
  if (userList instanceof Error) {
    return userList
  }

  const result = await errorListBoundary(async () =>
    Promise.all(
      userList.map(async (user): Promise<void | Error> => {
        const userTime = formatDateAsTime({
          instant,
          timeZone: user.timeZone,
        })
        const userDate = formatDateAsISODate({
          instant,
          timeZone: user.timeZone,
        })
        const isWeekend = dateFns.isWeekend(dateFns.parseISO(userDate))

        const dailyReminderTime =
          user.dailyReminderTime ?? HANDOVER_DAILY_REMINDER_TIME

        if (userTime >= dailyReminderTime && !isWeekend) {
          const post = await db.getPostWithItems({
            userId: user.id,
            date: userDate,
          })
          if (post instanceof Error) {
            return post
          }

          if (!post || post.items.length === 0) {
            const reminder = await db.getReminder({
              userId: user.id,
              date: userDate,
            })
            if (reminder instanceof Error) {
              return reminder
            }

            const userHasAlreadyBeenReminded = typeof reminder?.ts === 'string'
            if (!userHasAlreadyBeenReminded) {
              const sendReminderToUserResult = await sendReminderToUser({
                web,
                user,
                userDate,
              })
              if (sendReminderToUserResult instanceof Error) {
                return sendReminderToUserResult
              }
            }
          }
        }
      }),
    ),
  )
  if (result instanceof Error) {
    return result
  }
}

export { sendReminderToUser, checkAndRemindUsers, getLatestPost }

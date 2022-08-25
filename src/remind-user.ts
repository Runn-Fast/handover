import { WebClient } from '@slack/web-api'
import * as dateFns from 'date-fns'
import { User, Post } from '@prisma/client'

import { publishPrivateContentToSlack } from './publish-to-slack.js'
import { formatDateAsISODate, formatDateAsTime } from './date-utils.js'
import { generateReminder } from './ai.js'
import * as db from './db.js'
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

const sendReminderToUser = async (options: SendReminderToUserOptions) => {
  const { web, user, userDate } = options

  const dateOfLastPostUTC = getLatestPost(user.posts)?.date

  const daysSinceLastPost = dateOfLastPostUTC
    ? dateFns.differenceInDays(
        dateFns.parseISO(userDate),
        dateFns.parseISO(
          formatDateAsISODate({
            date: dateOfLastPostUTC,
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

  await db.upsertReminder({
    userId: user.id,
    date: userDate,
    text: reminderText,
    channel: user.id,
    ts: messageTs,
  })
}

type CheckAndRemindUsersOptions = {
  web: WebClient
}
const checkAndRemindUsers = async (options: CheckAndRemindUsersOptions) => {
  const { web } = options
  const now = new Date()
  const userList = await db.getActiveUserList({
    activeSince: dateFns.subDays(now, DAYS_SINCE_LAST_POST_CUT_OFF),
  })

  await Promise.all(
    userList.map(async (user) => {
      const userTime = formatDateAsTime({ date: now, timeZone: user.timeZone })
      const userDate = formatDateAsISODate({
        date: now,
        timeZone: user.timeZone,
      })
      const isWeekend = dateFns.isWeekend(dateFns.parseISO(userDate))

      if (userTime >= HANDOVER_DAILY_REMINDER_TIME && !isWeekend) {
        const post = await db.getPostWithItems({
          userId: user.id,
          date: userDate,
        })

        if (!post || post.items.length === 0) {
          const reminder = await db.getReminder({
            userId: user.id,
            date: userDate,
          })

          if (!reminder || !reminder.ts) {
            await sendReminderToUser({
              web,
              user,
              userDate,
            })
          }
        }
      }
    }),
  )
}

export { sendReminderToUser, checkAndRemindUsers, getLatestPost }

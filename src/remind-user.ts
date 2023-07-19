import type { WebClient } from '@slack/web-api'
import * as dateFns from 'date-fns'
import type { User, Post } from '@prisma/client'
import { errorListBoundary } from '@stayradiated/error-boundary'
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

const sendReminderToUser = async (
  options: SendReminderToUserOptions,
): Promise<void | Error> => {
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

type IsReminderNeededTodayOptions = {
  user: User
  userDate: string
  now: Date
}

const isReminderNeededToday = async (
  options: IsReminderNeededTodayOptions,
): Promise<boolean> => {
  const { user, userDate, now } = options

  const userTime = formatDateAsTime({
    date: now,
    timeZone: user.timeZone,
  })

  const isWeekend = dateFns.isWeekend(dateFns.parseISO(userDate))
  const dayOff = await db.getUserDailyReminderDayOff({
    userId: user.id,
  })
  const isDayOff = dayOff === dateFns.getDay(now)

  const dailyReminderTime =
    user.dailyReminderTime ?? HANDOVER_DAILY_REMINDER_TIME

  return userTime >= dailyReminderTime && !isWeekend && !isDayOff
}

type RemindUsersOptions = {
  web: WebClient
  user: User & { posts: Post[] }
  userDate: string
}

const remindUsers = async (
  options: RemindUsersOptions,
): Promise<void | Error> => {
  const { user, userDate, web } = options

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

    if (!reminder || !reminder.ts) {
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

type CheckAndRemindUsersOptions = {
  web: WebClient
}
const checkAndRemindUsers = async (
  options: CheckAndRemindUsersOptions,
): Promise<void | Error> => {
  const { web } = options
  const now = new Date()
  const userList = await db.getActiveUserList({
    activeSince: dateFns.subDays(now, DAYS_SINCE_LAST_POST_CUT_OFF),
  })
  if (userList instanceof Error) {
    return userList
  }

  const result = await errorListBoundary(async () =>
    Promise.all(
      userList.map(async (user): Promise<void | Error> => {
        const userDate = formatDateAsISODate({
          date: now,
          timeZone: user.timeZone,
        })

        const reminderNeededToday = await isReminderNeededToday({
          user,
          userDate,
          now,
        })

        if (reminderNeededToday) {
          remindUsers({ web, user, userDate })
        }
      }),
    ),
  )
  if (result instanceof Error) {
    return result
  }
}

export {
  sendReminderToUser,
  checkAndRemindUsers,
  getLatestPost,
  isReminderNeededToday,
}

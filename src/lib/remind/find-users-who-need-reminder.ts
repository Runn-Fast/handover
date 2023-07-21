import { Prisma } from '@prisma/client'
import * as dateFns from 'date-fns'
import { errorListBoundary } from '@stayradiated/error-boundary'
import { formatDateAsISODate, formatDateAsTime } from '../../date-utils.js'
import * as db from '../../db/index.js'
import type { UserWithPosts } from '../../db/index.js'

type FindUsersWhoNeedReminderOptions = {
  daysSinceLastPostCutOff: number
  defaultDailyReminderTime: string
}

const findUsersWhoNeedReminder = async (
  options: FindUsersWhoNeedReminderOptions,
): Promise<UserWithPosts[] | Error> => {
  const { daysSinceLastPostCutOff, defaultDailyReminderTime } = options
  const instant = Date.now()
  const userList = await db.getActiveUserList({
    startDate: dateFns.subDays(instant, daysSinceLastPostCutOff),
    endDate: dateFns.toDate(instant),
  })
  if (userList instanceof Error) {
    return userList
  }

  const usersWhoNeedReminderList = await errorListBoundary(async () =>
    Promise.all(
      userList.map(async (user): Promise<UserWithPosts | false | Error> => {
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
          user.dailyReminderTime ?? defaultDailyReminderTime

        if (userTime >= dailyReminderTime && !isWeekend) {
          const post = await db.getPostWithItems({
            userId: user.id,
            date: dateFns.parseISO(userDate),
          })
          const postNotFound = post instanceof Prisma.NotFoundError
          if (!postNotFound && post instanceof Error) {
            return post
          }

          if (postNotFound || post.items.length === 0) {
            const reminder = await db.getReminder({
              userId: user.id,
              date: userDate,
            })
            const reminderNotFound = reminder instanceof Prisma.NotFoundError
            if (!reminderNotFound && reminder instanceof Error) {
              return reminder
            }

            if (reminderNotFound) {
              return user
            }
          }
        }

        return false
      }),
    ),
  )

  if (usersWhoNeedReminderList instanceof Error) {
    return usersWhoNeedReminderList
  }

  return usersWhoNeedReminderList.filter((user): user is UserWithPosts => {
    return user !== false
  })
}

export { findUsersWhoNeedReminder }

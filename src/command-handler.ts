import type { WebClient } from '@slack/web-api'
import { publishPrivateContentToSlack } from './publish-to-slack.js'
import {
  getUserDailyReminderDayOff,
  getUserDailyReminderTime,
  updateUserDailyReminderTime,
  updateUserReminderDayOff,
} from './db.js'
import { Day } from 'date-fns'
import { HANDOVER_DAILY_REMINDER_TIME } from './constants.js'
import { formatDayName } from './date-utils.js'

type DailyReminderDefaultHandler = {
  userId: string
  web: WebClient
}

const dailyReminderDefaultHandler = async ({
  userId,
  web,
}: DailyReminderDefaultHandler): Promise<void | Error> => {
  const dailyReminderTime = await getUserDailyReminderTime({ userId })
  const dayOff = await getUserDailyReminderDayOff({ userId })

  if (dayOff instanceof Error) {
    return dayOff
  }

  if (dailyReminderTime instanceof Error) {
    return dailyReminderTime
  }

  const dayOffText = `${dayOff ? `except on ${formatDayName(dayOff)}` : ''}`

  if (dailyReminderTime) {
    await publishPrivateContentToSlack({
      web,
      userId,
      text: `You will be reminded each week day at ${dailyReminderTime} ${dayOffText}`,
    })
  } else {
    await publishPrivateContentToSlack({
      web,
      userId,
      text: `You will be reminded each week day at the default time of ${HANDOVER_DAILY_REMINDER_TIME} ${dayOffText}`,
    })
  }
}

type DailyReminderTimeUpdateHandler = {
  userId: string
  dailyReminderTime: string
  web: WebClient
}

const dailyReminderTimeUpdateHandler = async ({
  userId,
  dailyReminderTime,
  web,
}: DailyReminderTimeUpdateHandler): Promise<void | Error> => {
  const result = await updateUserDailyReminderTime({
    userId,
    dailyReminderTime,
  })

  if (result instanceof Error) {
    return result
  }

  await publishPrivateContentToSlack({
    web,
    userId,
    text: `✅ Ok, I will remind you each week day at ${dailyReminderTime}`,
  })
}

const dayOffValidator = (value: string) => {
  const validDays: Day[] = [1, 2, 3, 4, 5]
  const day = parseInt(value, 10) as Day

  if (day === 0 || day === 6) {
    return 'Nah, you cannot take a day off on the weekend'
  }
  if (!validDays.includes(day)) {
    return "It's gotta be one of the day of the week type ( 1 | 2 | 3 | 4 | 5 ), where 1 is Monday, like `remind -d 3`"
  }
  return true
}

type DayOffHandler = {
  userId: string
  dayOff: string
  web: WebClient
}

const dayOffHandler = async ({ userId, dayOff, web }: DayOffHandler) => {
  const dayOffResult = await updateUserReminderDayOff({
    userId,
    dayOff: parseInt(dayOff),
  })

  if (dayOffResult instanceof Error) {
    throw Error
  }

  await publishPrivateContentToSlack({
    web,
    userId,
    text: `✅ Updated! We'll leave you in peace every ${formatDayName(
      dayOffResult,
    )}`,
  })
}

export {
  dayOffValidator,
  dayOffHandler,
  dailyReminderDefaultHandler,
  dailyReminderTimeUpdateHandler,
}

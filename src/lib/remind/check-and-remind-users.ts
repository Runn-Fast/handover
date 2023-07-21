import type { WebClient } from '@slack/web-api'
import { formatDateAsISODate } from '../../date-utils.js'
import { sendReminderToUser } from './send-reminder-to-user.js'
import { findUsersWhoNeedReminder } from './find-users-who-need-reminder.js'

type CheckAndRemindUsersOptions = {
  web: WebClient
  daysSinceLastPostCutOff: number
  defaultDailyReminderTime: string
}
const checkAndRemindUsers = async (
  options: CheckAndRemindUsersOptions,
): Promise<void | Error> => {
  const { web, daysSinceLastPostCutOff, defaultDailyReminderTime } = options

  const instant = Date.now()

  const userList = await findUsersWhoNeedReminder({
    daysSinceLastPostCutOff,
    defaultDailyReminderTime,
  })
  if (userList instanceof Error) {
    return userList
  }

  const result = await Promise.all(
    userList.map(async (user) => {
      const userDate = formatDateAsISODate({
        instant,
        timeZone: user.timeZone,
      })

      const sendReminderToUserResult = await sendReminderToUser({
        web,
        user,
        userDate,
        daysSinceLastPostCutOff,
      })

      return sendReminderToUserResult
    }),
  )
  if (result instanceof Error) {
    return result
  }
}

export { checkAndRemindUsers }

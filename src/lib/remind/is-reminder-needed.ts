import * as dateFns from 'date-fns'

type IsReminderNeededOptions = {
  userWorkdays: number[]
  dailyReminderTime: string
  userDate: string
  userTime: string
}

const isReminderNeeded = async (
  options: IsReminderNeededOptions,
): Promise<boolean> => {
  const { userWorkdays, userDate, userTime, dailyReminderTime } = options

  const isWorkday = userWorkdays.includes(dateFns.parseISO(userDate).getDay())

  return userTime >= dailyReminderTime && isWorkday
}

export { isReminderNeeded }

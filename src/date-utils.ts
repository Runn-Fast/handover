import * as dateFns from 'date-fns'
import * as dateFnsTz from 'date-fns-tz'
import { format } from 'date-fns'
import initial from 'lodash/initial.js'
import last from 'lodash/last.js'

const dayNamesMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

type GetDateFromTsOptions = {
  ts: string
  timeZone: string

  // Which hour should a new day start at?
  // 0 = midnight
  // 1 = 1am...
  dayStartsAtHour: number
}

const getDateFromTs = (options: GetDateFromTsOptions): string => {
  const { ts, timeZone, dayStartsAtHour } = options

  // Days start at 3am, allows developers to write handover after midnight
  const instant = dateFns
    .subHours(dateFns.fromUnixTime(Number.parseInt(ts, 10)), dayStartsAtHour)
    .getTime()

  const output = formatDateAsISODate({
    instant,
    timeZone,
  })

  return output
}

type GetDateFromMessageOptions = {
  messageText: string
  ts: string
  timeZone: string
}

const getDateFromMessage = (
  options: GetDateFromMessageOptions,
): undefined | string | Error => {
  const { messageText, ts, timeZone } = options

  const instant = Number.parseInt(ts, 10) * 1000

  // Match if text starts with "(date):"
  const match = /^\((.+)\):/.exec(messageText)?.[1]
  if (typeof match !== 'string') {
    return
  }

  let date: number
  switch (match) {
    case 'today': {
      date = instant
      break
    }

    case '1 day ago':
    case 'yesterday': {
      date = dateFns.subDays(instant, 1).getTime()
      break
    }

    case '2 days ago': {
      date = dateFns.subDays(instant, 2).getTime()
      break
    }

    case '3 days ago': {
      date = dateFns.subDays(instant, 3).getTime()
      break
    }

    default: {
      return new Error(`⚠️ Sorry, that date is not supported: "${match}".

Supported dates:
- today
- yesterday
- 2 days ago
- 3 days ago`)
    }
  }

  if (date > instant) {
    // Date is in the future, so it's probably a mistake
    return
  }

  const output = formatDateAsISODate({
    instant: date,
    timeZone,
  })

  return output
}

type FormatDateOptions = {
  instant: number
  timeZone: string
  format: string
}

const formatDate = (options: FormatDateOptions): string => {
  const { instant, timeZone, format } = options
  const dateTime = dateFnsTz.utcToZonedTime(instant, timeZone)
  return dateFnsTz.format(dateTime, format, { timeZone })
}

type FormatDateAsISODate = {
  instant: number
  timeZone: string
}

const formatDateAsISODate = (options: FormatDateAsISODate) => {
  const { instant, timeZone } = options
  return (
    formatDate({ instant, timeZone, format: 'yyyy-MM-dd' }) + 'T00:00:00+00:00'
  )
}

type FormatDateAsTimeOptions = {
  instant: number
  timeZone: string
}

const formatDateAsTime = (options: FormatDateAsTimeOptions) => {
  const { instant, timeZone } = options
  return formatDate({ instant, timeZone, format: 'HH:mm' })
}

const formatDayName = (day: number) =>
  format(new Date(2023, 0, day + 1), 'EEEE')

const formatDayNames = (days: number[]) => {
  const dayNames = days.map((day) => formatDayName(day))

  if (dayNames.length === 1) {
    return dayNames[0]
  }

  return initial(dayNames).join(', ') + ' and ' + last(dayNames)
}

export {
  dayNamesMap,
  getDateFromTs,
  getDateFromMessage,
  formatDate,
  formatDateAsTime,
  formatDateAsISODate,
  formatDayName,
  formatDayNames,
}

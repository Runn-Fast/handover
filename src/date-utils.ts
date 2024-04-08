import * as dateFns from 'date-fns'
import * as dateFnsTz from 'date-fns-tz'

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

type FormatDateOptions = {
  instant: number
  timeZone: string
  format: string
}

const formatDate = (options: FormatDateOptions): string => {
  const { instant, timeZone, format } = options
  const dateTime = dateFnsTz.toZonedTime(instant, timeZone)
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

const formatDayOfWeek = (day: number): string => {
  switch (day) {
    case 0: {
      return 'Sunday'
    }

    case 1: {
      return 'Monday'
    }

    case 2: {
      return 'Tuesday'
    }

    case 3: {
      return 'Wednesday'
    }

    case 4: {
      return 'Thursday'
    }

    case 5: {
      return 'Friday'
    }

    case 6: {
      return 'Saturday'
    }

    default: {
      throw new Error(`Invalid day: ${String(day)}`)
    }
  }
}

const parseDayOfWeek = (dayName: string): number => {
  const lowerCaseDayName = dayName.toLowerCase()

  switch (lowerCaseDayName) {
    case 'monday': {
      return 1
    }

    case 'tuesday': {
      return 2
    }

    case 'wednesday': {
      return 3
    }

    case 'thursday': {
      return 4
    }

    case 'friday': {
      return 5
    }

    case 'saturday': {
      return 6
    }

    case 'sunday': {
      return 0
    }

    default: {
      throw new Error(`Invalid day name: ${dayName}`)
    }
  }
}

const formatDayOfWeekList = (days: number[]): string => {
  const nameList = days.map((day) => formatDayOfWeek(day))

  if (nameList.length === 1) {
    return nameList[0]!
  }

  // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  // => "Monday, Tuesday, Wednesday, Thursday and Friday"
  return nameList.slice(0, -1).join(', ') + ' and ' + nameList.at(-1)
}

export {
  getDateFromTs,
  formatDate,
  formatDateAsTime,
  formatDateAsISODate,
  formatDayOfWeek,
  parseDayOfWeek,
  formatDayOfWeekList,
}

import * as dateFns from 'date-fns'
import dateFnsTz from 'date-fns-tz'

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
  const date = dateFns.subHours(
    dateFns.fromUnixTime(Number.parseInt(ts, 10)),
    dayStartsAtHour,
  )

  const output = formatDateAsISODate({
    date,
    timeZone,
  })

  return output
}

type FormatDateOptions = {
  date: Date
  timeZone: string
  format: string
}

const formatDate = (options: FormatDateOptions): string => {
  const { date, timeZone, format } = options
  const dateTime = dateFnsTz.utcToZonedTime(date, timeZone)
  return dateFnsTz.format(dateTime, format, { timeZone })
}

type FormatDateAsISODate = {
  date: Date
  timeZone: string
}

const formatDateAsISODate = (options: FormatDateAsISODate) => {
  const { date, timeZone } = options
  return (
    formatDate({ date, timeZone, format: 'yyyy-MM-dd' }) + 'T00:00:00+00:00'
  )
}

type FormatDateAsTimeOptions = {
  date: Date
  timeZone: string
}

const formatDateAsTime = (options: FormatDateAsTimeOptions) => {
  const { date, timeZone } = options
  return formatDate({ date, timeZone, format: 'HH:mm' })
}

export { getDateFromTs, formatDate, formatDateAsTime, formatDateAsISODate }

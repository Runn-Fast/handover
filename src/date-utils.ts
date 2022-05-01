import * as dateFns from 'date-fns'
import { default as dateFnsTz } from 'date-fns-tz'

type GetDateFromTsOptions = {
  ts: string
  timeZone: string
}

const getDateFromTs = (options: GetDateFromTsOptions): string => {
  const { ts, timeZone } = options
  const date = dateFns.fromUnixTime(Number.parseInt(ts))
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

import * as dateFns from 'date-fns'
import { formatDateAsISODate } from './date-utils.js'

type ParseDateFromMessageOptions = {
  messageText: string
  ts: string
  timeZone: string
}

type ParseDateFromMessageResult =
  | {
      type: 'NO_MATCH'
    }
  | {
      type: 'MATCH'
      date: string
      message: string
    }

const parseDateFromMessage = (
  options: ParseDateFromMessageOptions,
): ParseDateFromMessageResult | Error => {
  const { messageText, ts, timeZone } = options

  const instant = Number.parseInt(ts, 10) * 1000

  // Match if text starts with "(date):"
  const regexMatch = /^\((today|yesterday|(\d+) days? ago)\): */.exec(
    messageText,
  )
  const relativeDate = regexMatch?.[1]
  const daysAgoString = regexMatch?.[2]
  if (!regexMatch || !relativeDate) {
    return { type: 'NO_MATCH' }
  }

  let date: number
  if (relativeDate === 'today') {
    date = instant
  } else if (relativeDate === 'yesterday') {
    date = dateFns.subDays(instant, 1).getTime()
  } else if (daysAgoString) {
    const daysAgoInt = Number.parseInt(daysAgoString, 10)
    date = dateFns.subDays(instant, daysAgoInt).getTime()
  } else {
    return new Error(`⚠️ Sorry, that date is not supported: "${relativeDate}".

Supported dates:
- today
- yesterday
- 1 day ago
- 2 days ago
- 3 days ago
- X days ago`)
  }

  if (date > instant) {
    // Date is in the future, so it's probably a mistake
    return new Error(
      `⚠️ That's odd, for some reason I think this in the future: "${relativeDate}".`,
    )
  }

  const output = formatDateAsISODate({
    instant: date,
    timeZone,
  })

  const messageWithoutRelativeDate = messageText.slice(regexMatch[0].length)

  const daysLater = dateFns.differenceInDays(instant, date)

  const alteredMessage =
    daysLater === 0
      ? messageWithoutRelativeDate
      : `_(${daysLater} ${daysLater === 1 ? 'day' : 'days'} late):_ ${messageWithoutRelativeDate}`

  return { type: 'MATCH', date: output, message: alteredMessage }
}

export { parseDateFromMessage }

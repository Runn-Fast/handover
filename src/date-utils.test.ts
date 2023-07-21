import { describe, test, expect } from 'vitest'
import {
  getDateFromTs,
  getDateFromMessage,
  formatDayOfWeek,
  formatDayOfWeekList,
  parseDayOfWeek,
} from './date-utils.js'

const formatTs = (date: Date): string => (date.getTime() / 1000).toString()

describe('getDateFromTs', () => {
  test('dayStartsAtHour=3, 9pm -> same day', () => {
    const dateString = getDateFromTs({
      ts: formatTs(new Date('2022-08-20T21:00:00.000+00:00')),
      timeZone: 'UTC',
      dayStartsAtHour: 3,
    })
    expect(dateString).toEqual('2022-08-20T00:00:00+00:00')
  })

  test('dayStartsAtHour=3, 2am -> previous day', () => {
    const dateString = getDateFromTs({
      ts: formatTs(new Date('2022-08-21T02:00:00.000+00:00')),
      timeZone: 'UTC',
      dayStartsAtHour: 3,
    })
    expect(dateString).toEqual('2022-08-20T00:00:00+00:00')
  })

  test('dayStartsAtHour=3, 3am -> same day', () => {
    const dateString = getDateFromTs({
      ts: formatTs(new Date('2022-08-21T03:00:00.000+00:00')),
      timeZone: 'UTC',
      dayStartsAtHour: 3,
    })
    expect(dateString).toEqual('2022-08-21T00:00:00+00:00')
  })
})

describe('GetDateFromTsOptions', () => {
  // 1am nz time
  const ts = formatTs(new Date('2023-07-18T01:00:00.000+12:00'))

  test('yesterday (UTC)', () => {
    const dateString = getDateFromMessage({
      messageText: '(yesterday): hello',
      ts,
      timeZone: 'UTC',
    })
    expect(dateString).toEqual('2023-07-16T00:00:00+00:00')
  })
  test('yesterday (NZ)', () => {
    const dateString = getDateFromMessage({
      messageText: '(yesterday): hello',
      ts,
      timeZone: 'Pacific/Auckland',
    })
    expect(dateString).toEqual('2023-07-17T00:00:00+00:00')
  })
  test('2 days ago (NZ)', () => {
    const dateString = getDateFromMessage({
      messageText: '(2 days ago): hello',
      ts,
      timeZone: 'Pacific/Auckland',
    })
    expect(dateString).toEqual('2023-07-16T00:00:00+00:00')
  })
  test('3 days ago (NZ)', () => {
    const dateString = getDateFromMessage({
      messageText: '(3 days ago): hello',
      ts,
      timeZone: 'Pacific/Auckland',
    })
    expect(dateString).toEqual('2023-07-15T00:00:00+00:00')
  })
})

describe('formatDayOfWeek', () => {
  test('each day of week', () => {
    expect(formatDayOfWeek(0)).toEqual('Sunday')
    expect(formatDayOfWeek(1)).toEqual('Monday')
    expect(formatDayOfWeek(2)).toEqual('Tuesday')
    expect(formatDayOfWeek(3)).toEqual('Wednesday')
    expect(formatDayOfWeek(4)).toEqual('Thursday')
    expect(formatDayOfWeek(5)).toEqual('Friday')
    expect(formatDayOfWeek(6)).toEqual('Saturday')
  })
})

describe('formatDayOfWeekList', () => {
  test('1 day', () => {
    expect(formatDayOfWeekList([0])).toEqual('Sunday')
    expect(formatDayOfWeekList([1])).toEqual('Monday')
    expect(formatDayOfWeekList([2])).toEqual('Tuesday')
    expect(formatDayOfWeekList([3])).toEqual('Wednesday')
    expect(formatDayOfWeekList([4])).toEqual('Thursday')
    expect(formatDayOfWeekList([5])).toEqual('Friday')
    expect(formatDayOfWeekList([6])).toEqual('Saturday')
  })

  test('2 days', () => {
    expect(formatDayOfWeekList([0, 1])).toEqual('Sunday and Monday')
    expect(formatDayOfWeekList([1, 2])).toEqual('Monday and Tuesday')
    expect(formatDayOfWeekList([2, 3])).toEqual('Tuesday and Wednesday')
    expect(formatDayOfWeekList([3, 4])).toEqual('Wednesday and Thursday')
    expect(formatDayOfWeekList([4, 5])).toEqual('Thursday and Friday')
    expect(formatDayOfWeekList([5, 6])).toEqual('Friday and Saturday')
    expect(formatDayOfWeekList([6, 0])).toEqual('Saturday and Sunday')
  })

  test('3 days', () => {
    expect(formatDayOfWeekList([0, 1, 2])).toEqual('Sunday, Monday and Tuesday')
    expect(formatDayOfWeekList([1, 2, 3])).toEqual(
      'Monday, Tuesday and Wednesday',
    )
    expect(formatDayOfWeekList([2, 3, 4])).toEqual(
      'Tuesday, Wednesday and Thursday',
    )
    expect(formatDayOfWeekList([3, 4, 5])).toEqual(
      'Wednesday, Thursday and Friday',
    )
    expect(formatDayOfWeekList([4, 5, 6])).toEqual(
      'Thursday, Friday and Saturday',
    )
    expect(formatDayOfWeekList([5, 6, 0])).toEqual(
      'Friday, Saturday and Sunday',
    )
  })

  test('4 days', () => {
    expect(formatDayOfWeekList([0, 1, 2, 3])).toEqual(
      'Sunday, Monday, Tuesday and Wednesday',
    )
    expect(formatDayOfWeekList([1, 2, 3, 4])).toEqual(
      'Monday, Tuesday, Wednesday and Thursday',
    )
    expect(formatDayOfWeekList([2, 3, 4, 5])).toEqual(
      'Tuesday, Wednesday, Thursday and Friday',
    )
    expect(formatDayOfWeekList([3, 4, 5, 6])).toEqual(
      'Wednesday, Thursday, Friday and Saturday',
    )
    expect(formatDayOfWeekList([4, 5, 6, 0])).toEqual(
      'Thursday, Friday, Saturday and Sunday',
    )
  })
})

describe('parseDayOfWeek', () => {
  test('each day of week', () => {
    expect(parseDayOfWeek('Sunday')).toEqual(0)
    expect(parseDayOfWeek('Monday')).toEqual(1)
    expect(parseDayOfWeek('Tuesday')).toEqual(2)
    expect(parseDayOfWeek('Wednesday')).toEqual(3)
    expect(parseDayOfWeek('Thursday')).toEqual(4)
    expect(parseDayOfWeek('Friday')).toEqual(5)
    expect(parseDayOfWeek('Saturday')).toEqual(6)
  })
})

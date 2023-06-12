import { test, expect } from 'vitest'
import { getDateFromTs } from './date-utils.js'

const formatTs = (date: Date): string => (date.getTime() / 1000).toString()

test('getDateFromTs: dayStartsAtHour=3, 9pm -> same day', () => {
  const dateString = getDateFromTs({
    ts: formatTs(new Date('2022-08-20T21:00:00.000+00:00')),
    timeZone: 'UTC',
    dayStartsAtHour: 3,
  })
  expect(dateString).toEqual('2022-08-20T00:00:00+00:00')
})

test('getDateFromTs: dayStartsAtHour=3, 2am -> previous day', () => {
  const dateString = getDateFromTs({
    ts: formatTs(new Date('2022-08-21T02:00:00.000+00:00')),
    timeZone: 'UTC',
    dayStartsAtHour: 3,
  })
  expect(dateString).toEqual('2022-08-20T00:00:00+00:00')
})

test('getDateFromTs: dayStartsAtHour=3, 3am -> same day', () => {
  const dateString = getDateFromTs({
    ts: formatTs(new Date('2022-08-21T03:00:00.000+00:00')),
    timeZone: 'UTC',
    dayStartsAtHour: 3,
  })
  expect(dateString).toEqual('2022-08-21T00:00:00+00:00')
})

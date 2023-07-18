import { describe, test, expect } from 'vitest'
import { getDateFromTs, getDateFromMessage } from './date-utils.js'

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

import { describe, test, expect } from 'vitest'
import { parseDateFromMessage } from './parse-date-from-message.js'

const formatTs = (date: Date): string => (date.getTime() / 1000).toString()

describe('GetDateFromTsOptions', () => {
  // 1am nz time
  const ts = formatTs(new Date('2023-07-18T01:00:00.000+12:00'))

  test('no match', () => {
    const dateString = parseDateFromMessage({
      messageText: 'hello',
      ts,
      timeZone: 'Pacific/Auckland',
    })
    expect(dateString).toEqual({ type: 'NO_MATCH' })
  })

  test('yesterday (UTC)', () => {
    const dateString = parseDateFromMessage({
      messageText: '(yesterday): hello',
      ts,
      timeZone: 'UTC',
    })
    expect(dateString).toEqual({
      type: 'MATCH',
      date: '2023-07-16T00:00:00+00:00',
      message: '_(1 day late):_ hello',
    })
  })
  test('yesterday (NZ)', () => {
    const dateString = parseDateFromMessage({
      messageText: '(yesterday): hello',
      ts,
      timeZone: 'Pacific/Auckland',
    })
    expect(dateString).toEqual({
      type: 'MATCH',
      date: '2023-07-17T00:00:00+00:00',
      message: '_(1 day late):_ hello',
    })
  })
  test('2 days ago (NZ)', () => {
    const dateString = parseDateFromMessage({
      messageText: '(2 days ago): hello',
      ts,
      timeZone: 'Pacific/Auckland',
    })
    expect(dateString).toEqual({
      type: 'MATCH',
      date: '2023-07-16T00:00:00+00:00',
      message: '_(2 days late):_ hello',
    })
  })
  test('3 days ago (NZ)', () => {
    const dateString = parseDateFromMessage({
      messageText: '(3 days ago): hello world',
      ts,
      timeZone: 'Pacific/Auckland',
    })
    expect(dateString).toEqual({
      type: 'MATCH',
      date: '2023-07-15T00:00:00+00:00',
      message: '_(3 days late):_ hello world',
    })
  })

  test('extract message', () => {
    const dateString = parseDateFromMessage({
      messageText: '(3 days ago): (4 days ago): (5 days ago): hello',
      ts,
      timeZone: 'Pacific/Auckland',
    })
    expect(dateString).toEqual({
      type: 'MATCH',
      date: '2023-07-15T00:00:00+00:00',
      message: '_(3 days late):_ (4 days ago): (5 days ago): hello',
    })
  })
  test('allow new lines', () => {
    const dateString = parseDateFromMessage({
      messageText: '(3 days ago):  \nhello world',
      ts,
      timeZone: 'Pacific/Auckland',
    })
    expect(dateString).toEqual({
      type: 'MATCH',
      date: '2023-07-15T00:00:00+00:00',
      message: '_(3 days late):_ \nhello world',
    })
  })
})

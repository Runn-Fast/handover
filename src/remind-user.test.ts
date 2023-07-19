import { test, expect } from 'vitest'
import { getLatestPost, isReminderNeededToday } from './remind-user.js'
import { randomUUID } from 'node:crypto'
import { upsertUser } from './db/upsert-user.js'
import { assertOk } from '@stayradiated/error-boundary'

test('getLatestPost', () => {
  const lastPost = getLatestPost([
    { date: new Date('2020-01-01') },
    { date: new Date('2020-01-02') },
    { date: new Date('2020-01-03') },
    { date: new Date('2020-01-04') },
  ])

  expect(lastPost).toEqual({ date: new Date('2020-01-04') })
})

test('isReminderNeededToday: should return true on weekday', async () => {
  // arrange
  const userId = randomUUID()
  const user = await upsertUser({
    id: userId,
    name: 'Test User',
    timeZone: 'UTC',
  })
  assertOk(user)
  const now = new Date('2023-07-18T08:24:00') // weekday
  const userDate = '2023-07-18'

  // act
  const reminderNeededToday = await isReminderNeededToday({
    user,
    userDate,
    instant: now.getTime(),
  })

  // assert
  expect(reminderNeededToday).toEqual(true)
})

test('isReminderNeededToday: should return false on weekend', async () => {
  // arrange
  const userId = randomUUID()
  const user = await upsertUser({
    id: userId,
    name: 'Test User',
    timeZone: 'UTC',
  })
  assertOk(user)
  const now = new Date('2023-07-16T08:24:00') // weekend
  const userDate = '2023-07-16'

  // act
  const reminderNeededToday = await isReminderNeededToday({
    user,
    userDate,
    instant: now.getTime(),
  })

  // assert
  expect(reminderNeededToday).toEqual(false)
})

test('isReminderNeededToday: should return false on day off', async () => {
  // arrange
  const userId = randomUUID()
  const user = await upsertUser({
    id: userId,
    name: 'Test User',
    timeZone: 'UTC',
    dayOff: 2,
  })
  assertOk(user)
  const now = new Date('2023-07-18T08:24:00') // weekday
  const userDate = '2023-07-18'

  // act
  const reminderNeededToday = await isReminderNeededToday({
    user,
    userDate,
    instant: now.getTime(),
  })

  // assert
  expect(reminderNeededToday).toEqual(false)
})

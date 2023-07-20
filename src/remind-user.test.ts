import { randomUUID } from 'node:crypto'
import { test, expect } from 'vitest'
import { assertOk } from '@stayradiated/error-boundary'
import { getLatestPost, isReminderNeededToday } from './remind-user.js'
import { upsertUser } from './db/upsert-user.js'

test('getLatestPost', () => {
  const lastPost = getLatestPost([
    { date: new Date('2020-01-01') },
    { date: new Date('2020-01-02') },
    { date: new Date('2020-01-03') },
    { date: new Date('2020-01-04') },
  ])

  expect(lastPost).toEqual({ date: new Date('2020-01-04') })
})

test('isReminderNeededToday: should return true on workday', async () => {
  // Arrange
  const userId = randomUUID()
  const user = await upsertUser({
    id: userId,
    name: 'Test User',
    timeZone: 'UTC',
    workdays: [1, 2],
  })
  assertOk(user)
  const now = new Date('2023-07-18T08:24:00') // weekday 2
  const userDate = '2023-07-18'

  // Act
  const reminderNeededToday = await isReminderNeededToday({
    user,
    userDate,
    instant: now.getTime(),
  })

  // Assert
  expect(reminderNeededToday).toEqual(true)
})

test('isReminderNeededToday: should return false on day off', async () => {
  // Arrange
  const userId = randomUUID()
  const user = await upsertUser({
    id: userId,
    name: 'Test User',
    timeZone: 'UTC',
    workdays: [1, 2],
  })
  assertOk(user)
  const now = new Date('2023-07-16T08:24:00') // weekday 0
  const userDate = '2023-07-16'

  // Act
  const reminderNeededToday = await isReminderNeededToday({
    user,
    userDate,
    instant: now.getTime(),
  })

  // Assert
  expect(reminderNeededToday).toEqual(false)
})

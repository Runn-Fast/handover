import { randomUUID } from 'node:crypto'
import { test, expect, beforeEach, describe } from 'vitest'
import { assertOk } from '@stayradiated/error-boundary'
import * as db from './index.js'

describe('getPostListWithItems', () => {
  const userId = randomUUID()
  const date = '2022-08-15T00:00:00+00:00'

  beforeEach(async () => {
    const user = await db.upsertUser({
      id: userId,
      name: 'Test User',
      timeZone: 'UTC',
    })
    assertOk(user)
  })

  test('getReminder: should support query batching', async () => {
    const reminder = await db.upsertReminder({ userId, date, text: 'text' })
    assertOk(reminder)

    const reminderList = await Promise.all([
      db.getReminder({ userId, date }),
      db.getReminder({ userId, date }),
    ])
    assertOk(reminderList[0])
    assertOk(reminderList[1])

    expect(reminderList[0]?.id).toEqual(reminder.id)
    expect(reminderList[1]?.id).toEqual(reminder.id)
  })
})

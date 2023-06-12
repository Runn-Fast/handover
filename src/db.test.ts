import { randomUUID } from 'node:crypto'
import { test, expect } from 'vitest'
import { assertOk } from '@stayradiated/error-boundary'
import * as db from './db.js'

test('getReminder: should support query batching', async () => {
  const userId = randomUUID()
  const date = '2022-08-15T00:00:00+00:00'

  assertOk(
    await db.upsertUser({ id: userId, name: 'Test User', timeZone: 'UTC' }),
  )

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

test('getPostWithItems: should support query batching', async () => {
  const userId = randomUUID()
  const date = '2022-08-15T00:00:00+00:00'

  assertOk(
    await db.upsertUser({ id: userId, name: 'Test User', timeZone: 'UTC' }),
  )
  const post = await db.upsertPost({ userId, title: 'Title', date })
  assertOk(post)

  assertOk(
    await db.addPostItem({
      postId: post.id,
      text: 'text',
      channel: 'channel',
      ts: Date.now().toString(),
    }),
  )

  const postList = await Promise.all([
    db.getPostWithItems({ userId, date }),
    db.getPostWithItems({ userId, date }),
  ])
  assertOk(postList[0])
  assertOk(postList[1])

  expect(postList[0]?.id).toEqual(post.id)
  expect(postList[1]?.id).toEqual(post.id)
})

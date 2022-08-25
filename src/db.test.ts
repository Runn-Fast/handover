import { randomUUID } from 'node:crypto'
import test from 'ava'

import * as db from './db.js'

test('getReminder: should support query batching', async (t) => {
  const userId = randomUUID()
  const date = '2022-08-15T00:00:00+00:00'

  await db.upsertUser({ id: userId, name: 'Test User', timeZone: 'UTC' })

  const reminder = await db.upsertReminder({ userId, date, text: 'text' })

  const reminderList = await Promise.all([
    db.getReminder({ userId, date }),
    db.getReminder({ userId, date }),
  ])

  t.is(reminderList[0]?.id, reminder.id)
  t.is(reminderList[1]?.id, reminder.id)
})

test('getPostWithItems: should support query batching', async (t) => {
  const userId = randomUUID()
  const date = '2022-08-15T00:00:00+00:00'

  await db.upsertUser({ id: userId, name: 'Test User', timeZone: 'UTC' })
  const post = await db.upsertPost({ userId, title: 'Title', date })

  await db.addPostItem({
    postId: post.id,
    text: 'text',
    channel: 'channel',
    ts: Date.now().toString(),
  })

  const postList = await Promise.all([
    db.getPostWithItems({ userId, date }),
    db.getPostWithItems({ userId, date }),
  ])

  t.is(postList[0]?.id, post.id)
  t.is(postList[1]?.id, post.id)
})

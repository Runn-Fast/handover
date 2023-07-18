import { randomUUID } from 'node:crypto'
import { test, expect, beforeEach, describe } from 'vitest'
import { assertOk } from '@stayradiated/error-boundary'
import * as db from './index.js'

describe('getPostWithItems', () => {
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

  test('should support query batching', async () => {
    const post = await db.upsertPost({ userId, title: 'Title', date })
    assertOk(post)

    const postItem = await db.upsertPostItem({
      postId: post.id,
      text: 'text',
      channel: 'channel',
      ts: Date.now().toString(),
    })
    assertOk(postItem)

    const postList = await Promise.all([
      db.getPostWithItems({ userId, date }),
      db.getPostWithItems({ userId, date }),
    ])
    assertOk(postList[0])
    assertOk(postList[1])

    expect(postList[0]?.id).toEqual(post.id)
    expect(postList[1]?.id).toEqual(post.id)
  })
})

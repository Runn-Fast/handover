import { randomUUID } from 'node:crypto'
import { test, expect, beforeEach, describe } from 'vitest'
import { assertOk } from '@stayradiated/error-boundary'
import * as dateFns from 'date-fns'
import * as db from './index.js'

describe('getPostListWithItems', () => {
  const userId = randomUUID()

  beforeEach(async () => {
    const user = await db.upsertUser({
      id: userId,
      name: 'Test User',
      timeZone: 'UTC',
    })
    assertOk(user)

    const startDateOne = Date.now() - 1 * 24 * 60 * 60 * 1000
    const startDateTwo = Date.now() - 2 * 24 * 60 * 60 * 1000

    const postOne = await db.upsertPost({
      userId,
      title: 'Title',
      date: new Date(startDateOne),
    })
    assertOk(postOne)

    const postTwo = await db.upsertPost({
      userId,
      title: 'Title',
      date: new Date(startDateTwo),
    })
    assertOk(postTwo)
  })

  test('should fetch posts for a period', async () => {
    // Act
    const postList = await db.getPostListWithItems({
      userId,
      startDate: dateFns.subDays(new Date(), 3),
      endDate: new Date(),
    })
    assertOk(postList)

    // Assert
    expect(postList.length).toEqual(2)
  })

  test('should not fetch posts outside of the period', async () => {
    // Act
    const postList = await db.getPostListWithItems({
      userId,
      startDate: dateFns.subDays(new Date(), 1),
      endDate: new Date(),
    })
    assertOk(postList)

    // Assert
    expect(postList.length).toEqual(1)
  })
})

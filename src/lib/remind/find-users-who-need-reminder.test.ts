import { randomUUID } from 'node:crypto'
import { vi, describe, test, expect } from 'vitest'
import { assertOk } from '@stayradiated/error-boundary'
import type { User } from '@prisma/client'
import * as dateFns from 'date-fns'
import {
  upsertUser,
  upsertPost,
  upsertPostItem,
  deleteUser,
} from '../../db/index.js'
import { findUsersWhoNeedReminder } from './find-users-who-need-reminder.js'

const daysSinceLastPostCutOff = 7
const defaultDailyReminderTime = '15:00'

// Should not be a weekend
vi.setSystemTime(new Date('2021-02-15T17:00:00.000Z'))

type Context = {
  user: User
}

const myTest = test.extend<Context>({
  async user({}, use) {
    const user = await upsertUser({
      id: randomUUID(),
      name: 'Test User xyz',
      timeZone: 'UTC',
    })
    assertOk(user)

    await use(user)

    const result = await deleteUser({ userId: user.id })
    assertOk(result)
  },
})

describe('findUsersWhoNeedReminder', () => {
  myTest('person who posted yesterday → true', async ({ user }) => {
    const yesterdaysPost = await upsertPost({
      userId: user.id,
      title: 'Test Post',
      date: dateFns.subDays(new Date(), 1),
    })
    assertOk(yesterdaysPost)

    const postItem = await upsertPostItem({
      postId: yesterdaysPost.id,
      text: '',
      channel: '',
      ts: Date.now().toString(),
    })
    assertOk(postItem)

    const userList = await findUsersWhoNeedReminder({
      daysSinceLastPostCutOff,
      defaultDailyReminderTime,
    })
    assertOk(userList)
    expect(userList).toHaveLength(1)
    expect(userList[0]!.id).toBe(user.id)
  })

  myTest('person with no posts → false', async ({ user }) => {
    // Must destructure user so that vitest creates them
    expect(user.id).toBeDefined()

    const userList = await findUsersWhoNeedReminder({
      daysSinceLastPostCutOff,
      defaultDailyReminderTime,
    })
    assertOk(userList)
    expect(userList).toHaveLength(0)
  })

  myTest('person with an empty post → false', async ({ user }) => {
    // Must destructure user so that vitest creates them
    expect(user.id).toBeDefined()

    const yesterdaysPost = await upsertPost({
      userId: user.id,
      title: 'Test Post',
      date: dateFns.subDays(new Date(), 1),
    })
    assertOk(yesterdaysPost)

    const userList = await findUsersWhoNeedReminder({
      daysSinceLastPostCutOff,
      defaultDailyReminderTime,
    })

    assertOk(userList)
    expect(userList).toHaveLength(0)
  })

  myTest('person with a post from > 7 days ago → false', async ({ user }) => {
    // Must destructure user so that vitest creates them
    expect(user.id).toBeDefined()

    const oldPost = await upsertPost({
      userId: user.id,
      title: 'Test Post',
      date: dateFns.subDays(new Date(), 8),
    })
    assertOk(oldPost)

    const postItem = await upsertPostItem({
      postId: oldPost.id,
      text: '',
      channel: '',
      ts: Date.now().toString(),
    })
    assertOk(postItem)

    const userList = await findUsersWhoNeedReminder({
      daysSinceLastPostCutOff,
      defaultDailyReminderTime,
    })

    assertOk(userList)
    expect(userList).toHaveLength(0)
  })

  myTest('person with a post from today → false', async ({ user }) => {
    // Must destructure user so that vitest creates them
    expect(user.id).toBeDefined()

    const todaysPost = await upsertPost({
      userId: user.id,
      title: 'Test Post',
      date: new Date(),
    })
    assertOk(todaysPost)

    const postItem = await upsertPostItem({
      postId: todaysPost.id,
      text: '',
      channel: '',
      ts: Date.now().toString(),
    })
    assertOk(postItem)

    const userList = await findUsersWhoNeedReminder({
      daysSinceLastPostCutOff,
      defaultDailyReminderTime,
    })

    assertOk(userList)
    expect(userList).toHaveLength(0)
  })
})

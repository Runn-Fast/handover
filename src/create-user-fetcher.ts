import type { WebClient } from '@slack/web-api'
import mem from 'mem'
import type { User } from '@prisma/client'
import * as z from 'zod'
import { errorBoundary } from '@stayradiated/error-boundary'
import * as db from './db/index.js'

const userInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  tz: z.string(),
  profile: z.object({
    real_name: z.string(),
    real_name_normalized: z.string(),
    display_name: z.string(),
    display_name_normalized: z.string(),
    first_name: z.string(),
    last_name: z.string(),
  }),
})

type UserFetcher = (user: string) => Promise<User | Error>

const forceFetchUser =
  (web: WebClient): UserFetcher =>
  async (userId) => {
    console.log(`Fetching info for ID "${userId}"`)
    const result = await errorBoundary(async () =>
      web.users.info({ user: userId }),
    )
    if (result instanceof Error) {
      return result
    }

    const userInfo = userInfoSchema.safeParse(result.user)
    if (!userInfo.success) {
      return userInfo.error
    }

    const user = await db.upsertUser({
      id: userInfo.data.id,
      name: userInfo.data.profile.display_name,
      timeZone: userInfo.data.tz,
    })

    return user
  }

const createUserFetcher = (web: WebClient): UserFetcher => {
  const fetchUser = mem(forceFetchUser(web), {
    cacheKey: ([userId]) => userId,
    maxAge: 5 * 60 * 1000,
  })
  return fetchUser
}

export { createUserFetcher }
export type { UserFetcher }

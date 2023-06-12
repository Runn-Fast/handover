import { type WebClient } from '@slack/web-api'
import mem from 'mem'
import { type User } from '@prisma/client'
import * as z from 'zod'
import * as db from './db.js'

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

type UserFetcher = (user: string) => Promise<User>

const forceFetchUser =
  (web: WebClient): UserFetcher =>
  async (userId: string): Promise<User> => {
    console.log(`Fetching info for ID "${userId}"`)
    const result = await web.users.info({ user: userId })
    const userInfo = userInfoSchema.safeParse(result.user)
    if (!userInfo.success) {
      throw userInfo.error
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
    maxAge: 5 * 60 * 1000,
  })
  return fetchUser
}

export default createUserFetcher

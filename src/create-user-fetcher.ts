import { WebClient } from '@slack/web-api'
import mem from 'mem'
import { Type } from '@sinclair/typebox'
import Ajv from 'ajv'
import { User } from '@prisma/client'

import * as db from './db.js'

const ajv = new Ajv()

const schema = Type.Strict(
  Type.Object({
    id: Type.String(),
    name: Type.String(),
    tz: Type.String(),
    profile: Type.Object({
      real_name: Type.String(),
      real_name_normalized: Type.String(),
      display_name: Type.String(),
      display_name_normalized: Type.String(),
      first_name: Type.String(),
      last_name: Type.String(),
    }),
  }),
)

const isValidUserInfo = ajv.compile(schema)

type UserFetcher = (user: string) => Promise<User>

const forceFetchUser =
  (web: WebClient): UserFetcher =>
  async (userId: string): Promise<User> => {
    console.log(`Fetching info for ID "${userId}"`)
    const result = await web.users.info({ user: userId })
    const userInfo = result.user
    if (!isValidUserInfo(userInfo)) {
      throw isValidUserInfo.errors
    }

    const user = await db.upsertUser({
      id: userInfo.id,
      name: userInfo.profile.display_name,
      timeZone: userInfo.tz,
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

import { WebClient } from '@slack/web-api'
import mem from 'mem'
import { Static, Type } from '@sinclair/typebox'
import Ajv from 'ajv'

const ajv = new Ajv()

const schema = Type.Strict(
  Type.Object({
    id: Type.String(),
    name: Type.String(),
    tz: Type.String(),
  }),
)

const isValidUser = ajv.compile(schema)

type User = Static<typeof schema>

type UserFetcher = (user: string) => Promise<void | User>

const forceFetchUser =
  (web: WebClient) =>
  async (userId: string): Promise<void | User> => {
    console.log(`Fetching info for ID "${userId}"`)
    const result = await web.users.info({ user: userId })
    const user = result.user
    if (!isValidUser(user)) {
      throw isValidUser.errors
    }

    return user
  }

const createUserFetcher = (web: WebClient): UserFetcher => {
  const fetchUser = mem(forceFetchUser(web), {
    maxAge: 60 * 1000,
  })
  return fetchUser
}

export default createUserFetcher

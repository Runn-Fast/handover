import { WebClient } from '@slack/web-api'
import mem from 'mem'

import { UserNameFetcher } from '../types.js'

type Profile = {
  first_name: string
}

type Result = {
  profile: Profile
}

const BLACK_LIST = ['', 'Important']

const forceFetchUserName =
  (web: WebClient) =>
  async (user: string): Promise<string> => {
    if (BLACK_LIST.includes(user)) {
      return user
    }

    console.log(`Fetching name of "${user}"`)
    try {
      const result = (await web.users.profile.get({
        user,
      })) as unknown as Result
      const { first_name: name } = result.profile
      return name
    } catch (error) {
      console.error(error)
      return user
    }
  }

const createUserNameFetcher = (web: WebClient): UserNameFetcher => {
  const fetchUserName = mem(forceFetchUserName(web), {
    maxAge: 60 * 1000,
  })
  return fetchUserName
}

export default createUserNameFetcher

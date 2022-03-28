import { Action, UserNameFetcher } from '../types.js'

import createActionUserMapper from '../utils/createActionUserMapper.js'

const AS_USER = /^\s*as\s+<@(\w+)>[:,]?\s/i

const mapActionAsDifferentUser =
  (fetchUserName: UserNameFetcher) =>
  async (action: Action): Promise<Action[]> => {
    const mapAction = createActionUserMapper({
      regExp: AS_USER,
      async mapAction(action, match) {
        const { userName, text } = action

        const toUser = match[1] ?? 'anonymous'
        const toUserName = await fetchUserName(toUser)
        const userText = text?.replace(AS_USER, '') ?? ''

        return {
          ...action,
          user: toUser,
          userName: toUserName,
          text: `(${userName}): ${userText}`,
        }
      },
    })

    return mapAction(action)
  }

export default mapActionAsDifferentUser

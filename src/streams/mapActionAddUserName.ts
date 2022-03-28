import { Action, UserNameFetcher } from '../types.js'

const mapActionAddUserName =
  (fetchUserName: UserNameFetcher) =>
  async (action: Action): Promise<Action> => {
    const { user } = action
    if (user != null) {
      const userName = await fetchUserName(user)
      return {
        ...action,
        userName,
      }
    }

    return action
  }

export default mapActionAddUserName

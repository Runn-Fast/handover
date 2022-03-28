import { assertNever } from '../assert.js'

import { Action, Store, Post, UserPost } from '../types.js'

const findOrCreateUserPost = async (
  store: Store,
  action: Action,
): Promise<UserPost> => {
  const { user, userName } = action

  let post = await store.getUserPost(user)
  if (post == null) {
    post = {
      type: 'USER',
      date: await store.getDate(),
      user,
      title: userName ?? '',
      items: [],
    }
    await store.setUserPost(user, post)
  }

  return post
}

const saveUserPost = async (store: Store, post: UserPost): Promise<void> => {
  await store.setUserPost(post.user, post)
}

const mapActionToPost =
  (store: Store) =>
  async (action: Action): Promise<Post[]> => {
    switch (action.type) {
      case 'ADD':
      case 'CHANGE': {
        const { ts = '0', text = '' } = action

        const post = await findOrCreateUserPost(store, action)
        const item = post.items.find((item) => item.sourceTs === ts)
        if (item == null) {
          post.items.push({ sourceTs: ts, text })
        } else {
          item.text = text
        }

        await saveUserPost(store, post)
        return [post]
      }

      case 'REMOVE': {
        const { ts } = action
        const post = await findOrCreateUserPost(store, action)
        const index = post.items.findIndex((item) => item.sourceTs === ts)
        if (index >= 0) {
          post.items.splice(index, 1)
        }

        await saveUserPost(store, post)
        return [post]
      }

      case 'RESET': {
        const { user } = action
        await store.delUserPost(user)
        const post = await findOrCreateUserPost(store, action)
        return [post]
      }

      case 'TITLE': {
        const { text } = action
        store.setDate(Date.now())
        return [
          {
            type: 'HANDOVER',
            title: text ?? '',
            date: await store.getDate(),
          },
        ]
      }

      case 'REMIND': {
        const { user } = action
        const post = await findOrCreateUserPost(store, action)
        if (post.items.length > 0) {
          return []
        }

        return [
          {
            type: 'REMIND',
            user,
          },
        ]
      }

      default:
        return assertNever(action)
    }
  }

export default mapActionToPost

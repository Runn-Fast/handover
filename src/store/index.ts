import NanoCache from 'nano-cache'
import mem from 'mem'
import NodePersist from 'node-persist'

import { UserPost, Store } from '../types.js'

const DATE = 'date'
const USER = 'users'
const CONTENT = 'content'

const userKey = (id: string) => `${USER}.${id}`
const contentKey = (id: string) => `${CONTENT}.${id}`

const createStore = mem(async (dir: string): Promise<Store> => {
  const cache = new NanoCache()
  const localStore = NodePersist.create({ dir })
  await localStore.init()

  const store = {
    async get(key: string) {
      const cachedValue = cache.get(key)
      if (cachedValue != null) {
        return cachedValue
      }

      const value = await localStore.getItem(key)
      if (value != null) {
        // Nano-cache doesn't like null values
        cache.set(key, value)
      }

      return value
    },
    async set(key: string, value: any, options: { ttl?: number } = {}) {
      cache.set(key, value, options)
      await localStore.setItem(key, value, options)
    },
    async del(key: string) {
      cache.del(key)
      await localStore.removeItem(key)
    },
  }

  return {
    async getDate() {
      const storeDate = await store.get(DATE)
      if (storeDate != null) {
        return storeDate
      }

      const date = Date.now()
      await store.set(DATE, date)
      return date
    },
    setDate: async (date: number) => store.set(DATE, date),

    getUserPost: async (user: string) => store.get(userKey(user)),
    setUserPost: async (user: string, post: UserPost) =>
      store.set(userKey(user), post),
    delUserPost: async (user: string) => store.del(userKey(user)),

    getContentTs: async (id: string) => store.get(contentKey(id)),
    setContentTs: async (id: string, ts: string) =>
      store.set(contentKey(id), ts, {
        ttl: 24 * 60 * 60 * 1000, // 24 hours
      }),
    delContentTs: async (id: string) => store.del(contentKey(id)),
  }
})

export default createStore

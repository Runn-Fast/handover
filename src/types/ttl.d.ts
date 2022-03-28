declare module 'ttl' {
  type Options = {
    ttl: number
  }

  export default class Cache<K, V> {
    public constructor(options: Options)
    public put(key: K, value: V): void
    public get(key: K): V
    public del(key: K): V
  }
}

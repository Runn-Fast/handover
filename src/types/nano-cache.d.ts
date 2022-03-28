declare module 'nano-cache' {
  export default class NanoCache {
    public get(key: string): any
    public del(key: string): void
    public set(key: string, value: any, options?: { ttl?: number }): void
  }
}

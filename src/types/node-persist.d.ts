declare module 'node-persist' {
  type LocalStore = {
    init(): Promise<void>
    getItem(key: string): Promise<any>
    removeItem(key: string): Promise<void>
    setItem(key: string, value: any, options?: { ttl?: number }): Promise<void>
  }

  namespace NodePersist {
    export function create(options: { dir: string }): LocalStore
  }

  export = NodePersist
}

declare module 'pull-pushable' {
  export type PushHandler<T> = (value: T) => void

  export interface Pushable<T> {
    (): () => T
    push: PushHandler<T>
  }

  export default function <T>(): Pushable<T>
}

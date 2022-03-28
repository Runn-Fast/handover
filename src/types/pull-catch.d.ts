declare module 'pull-catch' {
  import { PullThrough } from 'pull-stream'

  export default function <Output>(
    onError: (error: Error) => Output,
  ): PullThrough<any, Output>
}

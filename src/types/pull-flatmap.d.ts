declare module 'pull-flatmap' {
  import { PullThrough } from 'pull-stream'

  export default function flatmap<Input, Output>(
    transform: (value: Input) => Output[],
  ): PullThrough<Input, Output>
}

declare module 'pull-many' {
  import { PullSource } from 'pull-stream'

  export default function <Input>(
    sources: Array<PullSource<Input>>,
  ): PullSource<Input>
}

declare module 'pull-tap' {
  export function tap<Input>(handle: (value: Input) => void): () => Input
  export function asyncTap<Input>(
    handle: (value: Input) => Promise<void>,
  ): () => Input
}

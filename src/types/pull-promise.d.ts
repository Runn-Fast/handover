declare module 'pull-promise' {
  export function through<Input, Output>(
    transform: (value: Input) => Promise<Output>,
  ): () => void
}

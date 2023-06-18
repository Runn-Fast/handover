export type Action = {
  type: 'CHANGE' | 'REMOVE' | 'ADD'
  userId: string
  channel: string
  ts: string
  text: string
}

export type FormatFn = (text: string) => string

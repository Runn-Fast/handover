import type { KnownEventFromType, Context } from '@slack/bolt'

export type Action = {
  type: 'CHANGE' | 'REMOVE' | 'ADD'
  userId: string
  channel: string
  ts: string
  text: string
}

export type FormatFunction = (text: string) => string

export type Message = KnownEventFromType<'message'>
export type OnMessageFunction = (
  message: Message,
  context: Context,
) => Promise<void> | void

export { type Context } from '@slack/bolt'

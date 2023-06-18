import * as z from 'zod'
import type { Action } from './types.js'

const messageAddedSchema = z.object({
  subtype: z.optional(z.string()),
  channel: z.string(),
  user: z.string(),
  ts: z.string(),
  text: z.string(),
})

const messageChangedSchema = z.object({
  subtype: z.enum(['message_changed']),
  channel: z.string(),
  message: z.object({
    user: z.string(),
    ts: z.string(),
    text: z.string(),
  }),
})

const messageDeletedSchema = z.object({
  subtype: z.enum(['message_deleted']),
  channel: z.string(),
  previous_message: z.object({
    user: z.string(),
    ts: z.string(),
    text: z.string(),
  }),
})

const mapMessageToAction = (message: unknown): Action | Error => {
  const messageChanged = messageChangedSchema.safeParse(message)
  if (messageChanged.success) {
    return {
      type: 'CHANGE',
      userId: messageChanged.data.message.user,
      channel: messageChanged.data.channel,
      ts: messageChanged.data.message.ts,
      text: messageChanged.data.message?.text,
    }
  }

  const messageDeleted = messageDeletedSchema.safeParse(message)
  if (messageDeleted.success) {
    return {
      type: 'REMOVE',
      userId: messageDeleted.data.previous_message.user,
      channel: messageDeleted.data.channel,
      ts: messageDeleted.data.previous_message.ts,
      text: messageDeleted.data.previous_message.text,
    }
  }

  const messageAdded = messageAddedSchema.safeParse(message)
  if (messageAdded.success) {
    if (
      messageAdded.data.subtype === 'bot_message' ||
      messageAdded.data.subtype === 'reminder_add'
    ) {
      return new Error('Ignoring message from bot…')
    }

    return {
      type: 'ADD',
      userId: messageAdded.data.user,
      channel: messageAdded.data.channel,
      ts: messageAdded.data.ts,
      text: messageAdded.data.text,
    }
  }

  console.warn({
    messageAdded: messageAdded.error,
    messageChanged: messageChanged.error,
    messageDeleted: messageDeleted.error,
  })

  return new Error('Invalid message format')
}

export { mapMessageToAction }

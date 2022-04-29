import { Type } from '@sinclair/typebox'
import Ajv from 'ajv'

const ajv = new Ajv()

const messageAddedSchema = Type.Strict(
  Type.Object({
    subtype: Type.Optional(Type.String()),
    channel: Type.String(),
    user: Type.String(),
    ts: Type.String(),
    text: Type.String(),
  }),
)

const isValidMessageAdded = ajv.compile(messageAddedSchema)

const messageChangedSchema = Type.Strict(
  Type.Object({
    subtype: Type.String({ const: 'message_changed' }),
    channel: Type.String(),
    message: Type.Object({
      user: Type.String(),
      ts: Type.String(),
      text: Type.String(),
    }),
  }),
)

const isValidMessageChanged = ajv.compile(messageChangedSchema)

const messageDeletedSchema = Type.Strict(
  Type.Object({
    subtype: Type.String({ const: 'message_deleted' }),
    channel: Type.String(),
    previous_message: Type.Object({
      user: Type.String(),
      ts: Type.String(),
      text: Type.String(),
    }),
  }),
)

const isValidMessageDeleted = ajv.compile(messageDeletedSchema)

type Action = {
  type: 'CHANGE' | 'REMOVE' | 'ADD'
  userId: string
  channel: string
  ts: string
  text: string
}

const mapMessageToAction = (message: unknown): Action => {
  if (isValidMessageChanged(message)) {
    return {
      type: 'CHANGE',
      userId: message.message.user,
      channel: message.channel,
      ts: message.message.ts,
      text: message.message?.text,
    }
  }

  if (isValidMessageDeleted(message)) {
    return {
      type: 'REMOVE',
      userId: message.previous_message.user,
      channel: message.channel,
      ts: message.previous_message.ts,
      text: message.previous_message.text,
    }
  }

  if (isValidMessageAdded(message)) {
    if (
      message.subtype === 'bot_message' ||
      message.subtype === 'reminder_add'
    ) {
      throw new Error('Ignoring message from bot…')
    }

    return {
      type: 'ADD',
      userId: message.user,
      channel: message.channel,
      ts: message.ts,
      text: message.text,
    }
  }

  console.log(isValidMessageAdded.errors)
  console.log(isValidMessageDeleted.errors)
  console.log(isValidMessageChanged.errors)

  throw new Error('Invalid message format')
}

export { mapMessageToAction }

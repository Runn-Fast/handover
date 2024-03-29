import { test, expect } from 'vitest'
import { mapMessageToAction } from './map-message-to-action.js'

test('should handle message_changed', () => {
  const message = {
    subtype: 'message_changed',
    ts: 'root_ts',
    user: 'root_user',
    channel: 'root_channel',
    message: {
      user: 'message_user',
      ts: 'message_ts',
      text: 'message_text',
    },
    previous_message: {
      user: 'message_user',
      ts: 'message_ts',
      text: 'previous_message_text',
    },
  }

  const action = mapMessageToAction(message)

  expect(action).toEqual({
    type: 'CHANGE',
    userId: 'message_user',
    channel: 'root_channel',
    ts: 'message_ts',
    text: 'message_text',
  })
})

test('should handle message_deleted', () => {
  const message = {
    subtype: 'message_deleted',
    ts: 'root_ts',
    user: 'root_user',
    channel: 'root_channel',
    previous_message: {
      user: 'message_user',
      ts: 'message_ts',
      text: 'message_text',
    },
  }

  const action = mapMessageToAction(message)

  expect(action).toEqual({
    type: 'REMOVE',
    userId: 'message_user',
    channel: 'root_channel',
    ts: 'message_ts',
    text: 'message_text',
  })
})

test('should handle regular message', () => {
  const message = {
    subtype: 'message',
    ts: 'root_ts',
    user: 'root_user',
    text: 'root_text',
    channel: 'root_channel',
  }

  const action = mapMessageToAction(message)

  expect(action).toEqual({
    type: 'ADD',
    userId: 'root_user',
    channel: 'root_channel',
    ts: 'root_ts',
    text: 'root_text',
  })
})

import test from 'ava'

import mapMessageToAction from './mapMessageToAction.js'

test('should handle message_changed', (t) => {
  const message = {
    subtype: 'message_changed',
    ts: 'root_ts',
    user: 'root_user',
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

  t.deepEqual(action, {
    type: 'CHANGE',
    user: 'message_user',
    userName: 'message_user',
    ts: 'message_ts',
    text: 'message_text',
    previousText: 'previous_message_text',
  })
})

test('should handle message_deleted', (t) => {
  const message = {
    subtype: 'message_deleted',
    ts: 'root_ts',
    user: 'root_user',
    previous_message: {
      user: 'message_user',
      userName: 'message_user',
      ts: 'message_ts',
      text: 'message_text',
    },
  }

  const action = mapMessageToAction(message)

  t.deepEqual(action, {
    type: 'REMOVE',
    user: 'message_user',
    userName: 'message_user',
    ts: 'message_ts',
    text: 'message_text',
  })
})

test('should handle regular message', (t) => {
  const message = {
    subtype: 'message',
    ts: 'root_ts',
    user: 'root_user',
    text: 'root_text',
  }

  const action = mapMessageToAction(message)

  t.deepEqual(action, {
    type: 'ADD',
    user: 'root_user',
    userName: 'root_user',
    ts: 'root_ts',
    text: 'root_text',
  })
})

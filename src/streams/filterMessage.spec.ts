import test from 'ava'

import { Message } from '../types.js'
import filterMessage from './filterMessage.js'

const createMessage = (subtype: string | undefined): Message => ({
  subtype,
  user: 'user',
  ts: 'ts',
  text: 'text',
})

test('return false when message subtype is bot_message', (t) => {
  const action = createMessage('bot_message')
  const result = filterMessage(action)
  t.false(result)
})

test('return false when message subtype is reminder_add', (t) => {
  const action = createMessage('reminder_add')
  const result = filterMessage(action)
  t.false(result)
})

test('return true when message subtype is undefined', (t) => {
  const action = createMessage(undefined)
  const result = filterMessage(action)
  t.true(result)
})

test('return false for deleted message when previous_message is null', (t) => {
  const action = createMessage('message_deleted')
  const result = filterMessage(action)
  t.false(result)
})

test('return true for deleted message when previous_message is not null', (t) => {
  const action = createMessage('message_deleted')
  action.previous_message = createMessage('anything')
  const result = filterMessage(action)
  t.true(result)
})

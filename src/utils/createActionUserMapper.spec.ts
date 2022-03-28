import test from 'ava'

import { Action } from '../types.js'

import createActionUserMapper from './createActionUserMapper.js'

const TEST_REG_EXP = /^\s*test[:,]?\s/i

const mapActionAsTest = createActionUserMapper({
  regExp: TEST_REG_EXP,
  async mapAction(action) {
    const { userName, text } = action
    const userText = text?.replace(TEST_REG_EXP, '')
    return {
      ...action,
      user: 'Test',
      userName: 'Test',
      text: `(${userName}): ${userText}`,
    }
  },
})

test('should not change regular actions', async (t) => {
  const input: Action = {
    type: 'ADD',
    user: 'user',
    userName: 'userName',
    ts: 'ts',
    text: 'text',
  }

  const output = await mapActionAsTest(input)

  t.deepEqual(output, [input])
})

test('should detect messages', async (t) => {
  const text = 'test: root_text'

  const input: Action = {
    type: 'CHANGE',
    ts: 'root_ts',
    user: 'root_user',
    userName: 'root_userName',
    text,
  }

  const output = await mapActionAsTest(input)

  t.deepEqual(output, [
    {
      type: 'CHANGE',
      ts: 'root_ts',
      user: 'Test',
      userName: 'Test',
      text: '(root_userName): root_text',
    },
  ])
})

test('should handle a change from not match -> match', async (t) => {
  const input: Action = {
    type: 'CHANGE',
    ts: 'root_ts',
    user: 'root_user',
    userName: 'root_userName',
    text: 'test: my message',
    previousText: 'my message',
  }

  const output = await mapActionAsTest(input)

  t.deepEqual(output, [
    {
      type: 'CHANGE',
      ts: 'root_ts',
      user: 'Test',
      userName: 'Test',
      text: '(root_userName): my message',
      previousText: 'my message',
    },
    {
      type: 'REMOVE',
      ts: 'root_ts',
      user: 'root_user',
      userName: 'root_userName',
      text: 'test: my message',
      previousText: 'my message',
    },
  ])
})

test('should handle a change from match -> not match', async (t) => {
  const input: Action = {
    type: 'CHANGE',
    ts: 'root_ts',
    user: 'root_user',
    userName: 'root_userName',
    text: 'my message',
    previousText: 'test: my message',
  }

  const output = await mapActionAsTest(input)

  t.deepEqual(output, [
    {
      type: 'CHANGE',
      ts: 'root_ts',
      user: 'root_user',
      userName: 'root_userName',
      text: 'my message',
      previousText: 'test: my message',
    },
    {
      type: 'REMOVE',
      ts: 'root_ts',
      user: 'Test',
      userName: 'Test',
      text: '(root_userName): my message',
      previousText: 'test: my message',
    },
  ])
})

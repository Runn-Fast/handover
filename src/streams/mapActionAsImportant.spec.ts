import test from 'ava'

import { Action } from '../types.js'

import mapActionAsImportant from './mapActionAsImportant.js'

test('should not change regular actions', async (t) => {
  const input: Action = {
    type: 'ADD',
    user: 'user',
    userName: 'userName',
    ts: 'ts',
    text: 'text',
  }

  const output = await mapActionAsImportant(input)

  t.deepEqual(output, [input])
})

test('should detect important messages', async (t) => {
  const text = 'important root_text'

  const input: Action = {
    type: 'CHANGE',
    ts: 'root_ts',
    user: 'root_user',
    userName: 'root_userName',
    text,
  }

  const output = await mapActionAsImportant(input)

  t.deepEqual(output, [
    {
      type: 'CHANGE',
      ts: 'root_ts',
      user: 'Important',
      userName: 'Important',
      text: '(root_userName): root_text',
    },
  ])
})

test('should support commas', async (t) => {
  const text = 'important, root_text'

  const input: Action = {
    type: 'CHANGE',
    ts: 'root_ts',
    user: 'root_user',
    userName: 'root_userName',
    text,
  }

  const output = await mapActionAsImportant(input)

  t.deepEqual(output, [
    {
      type: 'CHANGE',
      ts: 'root_ts',
      user: 'Important',
      userName: 'Important',
      text: '(root_userName): root_text',
    },
  ])
})

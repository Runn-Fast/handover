import test from 'ava'

import { Action } from '../types.js'

import mapActionWithURL from './mapActionWithURL.js'

test('should not change regular actions', (t) => {
  const input: Action = {
    type: 'ADD',
    user: 'user',
    userName: 'userName',
    ts: 'ts',
    text: 'text',
  }

  const output = mapActionWithURL(input)

  t.deepEqual(input, output)
})

test('should replace markdown URLs', (t) => {
  const input: Action = {
    type: 'CHANGE',
    ts: 'ts',
    user: 'user',
    userName: 'userName',
    text: 'check out our [github](<https://github.com/mishguruorg>)',
  }

  const output = mapActionWithURL(input)

  t.deepEqual(output, {
    type: 'CHANGE',
    ts: 'ts',
    user: 'user',
    userName: 'userName',
    text: 'check out our <https://github.com/mishguruorg|github>',
  })
})

test('should replace multiple markdown URLs', (t) => {
  const input: Action = {
    type: 'CHANGE',
    ts: 'ts',
    user: 'user',
    userName: 'userName',
    text: '[link 1](<https://mish.gr/1>) and [link 2](<https://mish.gr/2>)',
  }

  const output = mapActionWithURL(input)

  t.deepEqual(output, {
    type: 'CHANGE',
    ts: 'ts',
    user: 'user',
    userName: 'userName',
    text: '<https://mish.gr/1|link 1> and <https://mish.gr/2|link 2>',
  })
})

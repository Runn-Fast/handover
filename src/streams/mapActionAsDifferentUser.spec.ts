import test from 'ava'
import sinon from 'sinon'

import { Action } from '../types.js'

import mapActionAsDifferentUser from './mapActionAsDifferentUser.js'

test('should not change regular actions', async (t) => {
  const input: Action = {
    type: 'ADD',
    user: 'user',
    userName: 'userName',
    ts: 'ts',
    text: 'text',
  }

  const fetchUserName = sinon.stub().resolves()

  const output = await mapActionAsDifferentUser(fetchUserName)(input)

  t.deepEqual(output, [input])
})

test('should map action to a different user', async (t) => {
  const text = 'as <@user>: text'

  const input: Action = {
    type: 'ADD',
    ts: 'ts',
    user: 'root',
    userName: 'Root',
    text,
  }

  const fetchUserName = sinon.stub().resolves('User')

  const output = await mapActionAsDifferentUser(fetchUserName)(input)

  t.deepEqual(output, [
    {
      type: 'ADD',
      ts: 'ts',
      user: 'user',
      userName: 'User',
      text: '(Root): text',
    },
  ])
})

test('should support commas', async (t) => {
  const text = 'as <@user>, text'

  const input: Action = {
    type: 'ADD',
    ts: 'ts',
    user: 'root',
    userName: 'Root',
    text,
  }

  const fetchUserName = sinon.stub().resolves('User')

  const output = await mapActionAsDifferentUser(fetchUserName)(input)

  t.deepEqual(output, [
    {
      type: 'ADD',
      ts: 'ts',
      user: 'user',
      userName: 'User',
      text: '(Root): text',
    },
  ])
})

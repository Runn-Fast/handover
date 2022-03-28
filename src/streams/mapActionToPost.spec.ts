import test from 'ava'
import sinon from 'sinon'
import { v4 as uuid } from 'uuid'

import createStore from '../store/index.js'
import {
  AddAction,
  ChangeAction,
  RemoveAction,
  ResetAction,
  Store,
  TitleAction,
} from '../types.js'
import mapActionToPost from './mapActionToPost.js'

sinon.useFakeTimers(Date.now())

const USER = 'user'
const USER_NAME = 'userName'
const DATE = Date.now()

const setupStore = async (ts: string, text: string): Promise<Store> => {
  const store = await createStore(`/tmp/handover-test/${uuid()}`)
  store.setDate(DATE)
  store.setUserPost(USER, {
    type: 'USER',
    date: DATE,
    user: USER,
    title: USER_NAME,
    items: [
      {
        sourceTs: ts,
        text,
      },
    ],
  })
  return store
}

test('ADD should add new item', async (t) => {
  const store = await setupStore('ts1', 'text1')
  const action: AddAction = {
    type: 'ADD',
    user: USER,
    userName: USER_NAME,
    ts: 'ts2',
    text: 'text2',
  }
  const post = await mapActionToPost(store)(action)
  t.deepEqual(post, [
    {
      type: 'USER',
      date: DATE,
      user: USER,
      title: USER_NAME,
      items: [
        {
          sourceTs: 'ts1',
          text: 'text1',
        },
        {
          sourceTs: 'ts2',
          text: 'text2',
        },
      ],
    },
  ])
})

test('CHANGE should replace existing item', async (t) => {
  const store = await setupStore('ts', 'text1')
  const action: ChangeAction = {
    type: 'CHANGE',
    user: USER,
    userName: USER_NAME,
    ts: 'ts',
    text: 'text2',
  }
  const post = await mapActionToPost(store)(action)
  t.deepEqual(post, [
    {
      type: 'USER',
      date: DATE,
      user: USER,
      title: USER_NAME,
      items: [
        {
          sourceTs: 'ts',
          text: 'text2',
        },
      ],
    },
  ])
})

test('REMOVE should remove existing item', async (t) => {
  const store = await setupStore('ts', 'text')
  const action: RemoveAction = {
    type: 'REMOVE',
    user: USER,
    userName: USER_NAME,
    ts: 'ts',
    text: 'text',
  }
  const post = await mapActionToPost(store)(action)
  t.deepEqual(post, [
    {
      type: 'USER',
      date: DATE,
      user: USER,
      title: USER_NAME,
      items: [],
    },
  ])
})

test('RESET should reset a user', async (t) => {
  const store = await setupStore('ts', 'text')
  const action: ResetAction = {
    type: 'RESET',
    user: USER,
    userName: USER_NAME,
    ts: '',
    text: '',
  }
  const post = await mapActionToPost(store)(action)
  t.deepEqual(post, [
    {
      type: 'USER',
      date: DATE,
      user: USER,
      title: USER_NAME,
      items: [],
    },
  ])
})

test('TITLE should create a new handover post', async (t) => {
  const store = await setupStore('ts', 'text')
  const action: TitleAction = {
    type: 'TITLE',
    user: '',
    userName: USER_NAME,
    ts: '',
    text: 'title',
  }
  const post = await mapActionToPost(store)(action)
  t.deepEqual(post, [
    {
      type: 'HANDOVER',
      date: DATE,
      title: 'title',
    },
  ])
})

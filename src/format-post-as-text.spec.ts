import test from 'ava'
import { PostItem } from '@prisma/client'

import { PostWithItems } from './db.js'
import { formatPostAsText } from './format-post-as-text.js'

const post = (title: string, items: PostItem[]): PostWithItems => ({
  id: 0,
  title,
  items,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'userId',
  date: new Date('2000-01-01'),
  channel: 'channel',
  ts: 'ts',
})

const item = (text: string): PostItem => ({
  id: 0,
  text,
  createdAt: new Date(),
  updatedAt: new Date(),
  postId: 0,
  channel: 'channel',
  ts: 'ts',
})

test('with multiple items', (t) => {
  const text = formatPostAsText(
    post('Title', [
      item('this is item 1'),
      item('this is item 2'),
      item('this is item 3'),
    ]),
  )

  t.is(
    text,
    `
*Title*
• this is item 1
• this is item 2
• this is item 3`,
  )
})

test('with multiple lines in a single item', (t) => {
  const text = formatPostAsText(
    post('Title', [
      item(`this is item 1
this is item 2
this is item 3`),
    ]),
  )

  t.is(
    text,
    `
*Title*
• this is item 1
• this is item 2
• this is item 3`,
  )
})

test('with existing bullet points', (t) => {
  const text = formatPostAsText(
    post('Title', [
      item(`• this is item 1
• this is item 2
• this is item 3`),
    ]),
  )

  t.is(
    text,
    `
*Title*
• this is item 1
• this is item 2
• this is item 3`,
  )
})

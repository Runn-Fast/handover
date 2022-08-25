import test from 'ava'

import { getLatestPost } from './remind-user.js'

test('getLatestPost', (t) => {
  const lastPost = getLatestPost([
    { date: new Date('2020-01-01') },
    { date: new Date('2020-01-02') },
    { date: new Date('2020-01-03') },
    { date: new Date('2020-01-04') },
  ])

  t.deepEqual(lastPost, { date: new Date('2020-01-04') })
})

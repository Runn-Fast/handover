import { describe, test, expect } from 'vitest'
import { getLatestPost } from './get-latest-post.js'

describe('getLatestPost', () => {
  test('should get latest post by date', () => {
    const lastPost = getLatestPost([
      { date: new Date('2020-01-01') },
      { date: new Date('2020-01-02') },
      { date: new Date('2020-01-03') },
      { date: new Date('2020-01-04') },
    ])

    expect(lastPost).toEqual({ date: new Date('2020-01-04') })
  })
})

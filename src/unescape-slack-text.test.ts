import { describe, test, expect } from 'vitest'
import { unescapeSlackText } from './unescape-slack-text.js'

describe('unescapeSlackText', () => {
  test('unescapes &amp;', () => {
    expect(unescapeSlackText('hello &amp; goodbye')).toBe('hello & goodbye')
  })
  test('unescapes &lt;', () => {
    expect(unescapeSlackText('hello &lt; goodbye')).toBe('hello < goodbye')
  })
  test('unescapes &gt;', () => {
    expect(unescapeSlackText('hello &gt; goodbye')).toBe('hello > goodbye')
  })
})

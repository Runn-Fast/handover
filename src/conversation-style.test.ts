import { describe, expect, test } from 'vitest'
import {
  formatConversationStyleList,
  parseConversationStyle,
} from './conversation-style.js'

describe('parseConversationStyle', () => {
  test('normalizes valid conversation styles', () => {
    expect(parseConversationStyle('BASIC')).toBe('basic')
    expect(parseConversationStyle(' kiwi ')).toBe('kiwi')
  })

  test('returns a useful error for invalid conversation styles', () => {
    const result = parseConversationStyle('pirate')

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toContain(
      'Please use one of [ standard | basic | humorous | british | kiwi | unhinged ].',
    )
  })
})

describe('formatConversationStyleList', () => {
  test('lists every supported conversation style', () => {
    expect(formatConversationStyleList()).toMatchInlineSnapshot(`
      "• \`standard\`: current casual funny reminder
      • \`basic\`: simple fixed reminder without AI
      • \`humorous\`: light slapstick humor
      • \`british\`: old-timey British colloquial tone
      • \`kiwi\`: casual Kiwi slang
      • \`unhinged\`: chaotic and absurd, but workplace-safe"
    `)
  })
})

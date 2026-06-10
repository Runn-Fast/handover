import { describe, expect, test, vi } from 'vitest'
import {
  createReminderPrompt,
  generateReminder,
  getConversationStyleInstruction,
  type CreateReminderCompletion,
} from './ai.js'
import type { ConversationStyle } from './conversation-style.js'

describe('generateReminder', () => {
  test('basic style returns fixed text without hitting the LLM', async () => {
    const createReminderCompletion = vi.fn<CreateReminderCompletion>()

    const reminder = await generateReminder(
      {
        name: 'Sam',
        daysSinceLastPost: 1,
        conversationStyle: 'basic',
      },
      {
        createReminderCompletion,
      },
    )

    expect(reminder).toBe('What did you work on today?')
    expect(createReminderCompletion).not.toHaveBeenCalled()
  })

  test('standard style preserves the current generated reminder path', async () => {
    const createReminderCompletion = vi.fn<CreateReminderCompletion>(
      async () => ({
        choices: [
          {
            message: {
              content: 'Generated reminder',
            },
          },
        ],
      }),
    )

    const reminder = await generateReminder(
      {
        name: 'Sam',
        daysSinceLastPost: 2,
        conversationStyle: 'standard',
      },
      {
        createReminderCompletion,
      },
    )

    expect(reminder).toBe('Generated reminder')
    expect(createReminderCompletion).toHaveBeenCalledTimes(1)
  })
})

describe('createReminderPrompt', () => {
  test.each([
    ['humorous', 'light slapstick-style humor'],
    ['british', 'old-timey British colloquial tone'],
    ['kiwi', 'casual New Zealand slang'],
    ['unhinged', 'chaotic, absurd energy'],
  ] satisfies Array<[ConversationStyle, string]>)(
    'adds the %s style instruction',
    (conversationStyle, expectedInstruction) => {
      const { userPrompt } = createReminderPrompt({
        name: 'Sam',
        daysSinceLastPost: 2,
        conversationStyle,
      })

      expect(userPrompt).toContain(expectedInstruction)
      expect(getConversationStyleInstruction(conversationStyle)).toContain(
        expectedInstruction,
      )
    },
  )
})

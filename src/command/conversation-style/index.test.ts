import { randomUUID } from 'node:crypto'
import type { WebClient } from '@slack/web-api'
import { assertOk } from '@stayradiated/error-boundary'
import { describe, expect, test, vi } from 'vitest'
import { execCommand } from '../index.js'
import { deleteUser, getUser, upsertUser } from '../../db/index.js'

type PostedMessage = {
  channel: string
  text: string
  unfurl_links: false
}

const createMockWeb = () => {
  const messages: PostedMessage[] = []
  const postMessage = vi.fn(async (message: PostedMessage) => {
    messages.push(message)
    return { ts: '123.456' }
  })

  const web = {
    chat: {
      postMessage,
    },
  } as unknown as WebClient

  return {
    messages,
    web,
  }
}

const runConversationStyleCommand = async (options: {
  userId: string
  text: string
  web: WebClient
}) => {
  const { userId, text, web } = options

  await execCommand({
    web,
    action: {
      type: 'ADD',
      userId,
      channel: 'C123',
      ts: '123.456',
      text: `<@BOTUSER1234> conversation-style${text ? ` ${text}` : ''}`,
    },
  })
}

describe('conversation-style command', () => {
  test('shows the current default style and options', async () => {
    const userId = randomUUID()
    const { messages, web } = createMockWeb()

    const user = await upsertUser({
      id: userId,
      name: 'Test User',
      timeZone: 'UTC',
    })
    assertOk(user)

    try {
      await runConversationStyleCommand({ userId, text: '', web })

      expect(messages).toHaveLength(1)
      expect(messages[0]?.channel).toBe(userId)
      expect(messages[0]?.text).toContain(
        'Your reminder conversation style is currently `standard`.',
      )
      expect(messages[0]?.text).toContain('• `basic`: simple fixed reminder')
    } finally {
      assertOk(await deleteUser({ userId }))
    }
  })

  test('updates the user conversation style', async () => {
    const userId = randomUUID()
    const { messages, web } = createMockWeb()

    const user = await upsertUser({
      id: userId,
      name: 'Test User',
      timeZone: 'UTC',
    })
    assertOk(user)

    try {
      await runConversationStyleCommand({ userId, text: 'KiWi', web })

      const updatedUser = await getUser({ userId })
      assertOk(updatedUser)

      expect(updatedUser.conversationStyle).toBe('kiwi')
      expect(messages).toEqual([
        {
          channel: userId,
          text: '✅ Sounds good, your reminder conversation style is now `kiwi`.',
          unfurl_links: false,
        },
      ])
    } finally {
      assertOk(await deleteUser({ userId }))
    }
  })

  test('returns a private error for invalid styles', async () => {
    const userId = randomUUID()
    const { messages, web } = createMockWeb()

    const user = await upsertUser({
      id: userId,
      name: 'Test User',
      timeZone: 'UTC',
    })
    assertOk(user)

    try {
      await runConversationStyleCommand({ userId, text: 'pirate', web })

      const updatedUser = await getUser({ userId })
      assertOk(updatedUser)

      expect(updatedUser.conversationStyle).toBe('standard')
      expect(messages).toHaveLength(1)
      expect(messages[0]?.channel).toBe(userId)
      expect(messages[0]?.text).toContain(
        '⚠️ Invalid conversation style "pirate"',
      )
    } finally {
      assertOk(await deleteUser({ userId }))
    }
  })
})

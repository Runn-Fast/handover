import { OPENAI_API_KEY } from './constants.js'
import {
  defaultConversationStyle,
  type ConversationStyle,
} from './conversation-style.js'

const pick = (array: string[]): string => {
  if (array.length === 0) {
    throw new Error('array.length must be >= 1')
  }

  return array[Math.floor(Math.random() * array.length)]!
}

type GenerateReminderOptions = {
  name: string
  daysSinceLastPost: number
  conversationStyle?: ConversationStyle
}

type ReminderMessage = {
  role: 'system' | 'user'
  content: string
}

type ReminderCompletionRequest = {
  model: string
  messages: ReminderMessage[]
}

type ReminderCompletionResponse = {
  choices?: Array<{
    message: {
      content?: string
    }
  }>
}

type CreateReminderCompletion = (
  request: ReminderCompletionRequest,
) => Promise<ReminderCompletionResponse>

type GenerateReminderDependencies = {
  createReminderCompletion?: CreateReminderCompletion
}

type ReminderPrompt = {
  systemPrompt: string
  userPrompt: string
}

let openaiClient:
  | {
      chat: {
        completions: {
          create: CreateReminderCompletion
        }
      }
    }
  | undefined

const createOpenAIReminderCompletion: CreateReminderCompletion = async (
  request,
) => {
  const { default: OpenAI } = await import('openai')

  openaiClient ??= new OpenAI({
    apiKey: OPENAI_API_KEY,
  }) as {
    chat: {
      completions: {
        create: CreateReminderCompletion
      }
    }
  }

  return openaiClient.chat.completions.create(request)
}

const getConversationStyleInstruction = (
  conversationStyle: ConversationStyle,
): string | undefined => {
  switch (conversationStyle) {
    case 'standard': {
      return undefined
    }

    case 'humorous': {
      return 'Use light slapstick-style humor, as if the workday briefly tripped over its own shoelaces.'
    }

    case 'british': {
      return 'Use an old-timey British colloquial tone, warm and quaint without being hard to understand.'
    }

    case 'kiwi': {
      return 'Use casual New Zealand slang and phrasing, friendly and relaxed without overdoing it.'
    }

    case 'unhinged': {
      return 'Use chaotic, absurd energy that feels completely bananas, while staying workplace-safe and kind.'
    }

    case 'basic': {
      return undefined
    }
  }
}

const createReminderPrompt = (
  options: Required<GenerateReminderOptions>,
): ReminderPrompt => {
  const { name, daysSinceLastPost, conversationStyle } = options

  const systemPrompt = `You are a helpful assistant.`

  const concern =
    daysSinceLastPost > 1
      ? `It has been ${daysSinceLastPost} days since we last heard from`
      : pick([
          'I am looking forward to hearing about',
          'I am excited to hear about',
          "I can't wait to hear about",
          'I have been waiting all day to hear about',
        ])

  const relation = pick(['my colleague', 'my buddy', 'my friend', 'my mate'])

  const role = pick([
    'who is an engineer',
    'who is a software developer',
    'who works for Runn',
    'who is an amazing person',
    'who is living their best life',
    'who is your best friend',
  ])

  const action = pick([
    'I want to send them a text message to ask',
    'I want to call them on the phone to ask',
    'I want to ask them a question about',
  ])

  const question = pick([
    'how they are going',
    'what they are up to',
    'what they have been working on',
    'how is their day going',
    'what they would like to share with the team',
  ])

  let task =
    'Could you please write a very short message (2 sentences max) that I can ask them? Please be informal and casual, but also funny.'

  const styleInstruction = getConversationStyleInstruction(conversationStyle)
  if (styleInstruction) {
    task += ` ${styleInstruction}`
  }

  const userPrompt = `${concern} ${relation}, ${name}, ${role}. ${action} ${question}. ${task}`

  return {
    systemPrompt,
    userPrompt,
  }
}

const generateReminder = async (
  options: GenerateReminderOptions,
  dependencies: GenerateReminderDependencies = {},
): Promise<string> => {
  const conversationStyle =
    options.conversationStyle ?? defaultConversationStyle

  const defaultPrompt = `Hey ${options.name}, what have you been working today?`
  if (conversationStyle === 'basic') {
    return 'What did you work on today?'
  }

  const { systemPrompt, userPrompt } = createReminderPrompt({
    ...options,
    conversationStyle,
  })
  const createReminderCompletion =
    dependencies.createReminderCompletion ?? createOpenAIReminderCompletion

  try {
    const response = await createReminderCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const text = response.choices?.[0]?.message.content
      ?.trim()
      ?.replace(/".?$/, '')

    if (!text) {
      return defaultPrompt
    }

    return text
  } catch (error) {
    console.error('Error generating reminder:', error)

    return defaultPrompt
  }
}

export {
  createReminderPrompt,
  generateReminder,
  getConversationStyleInstruction,
}
export type { CreateReminderCompletion }

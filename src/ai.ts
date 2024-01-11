import OpenAI from 'openai'
import { OPENAI_API_KEY } from './constants.js'

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

const pick = (array: string[]): string => {
  if (array.length === 0) {
    throw new Error('array.length must be >= 1')
  }

  return array[Math.floor(Math.random() * array.length)]!
}

type GenerateReminderOptions = {
  name: string
  daysSinceLastPost: number
}

const generateReminder = async (
  options: GenerateReminderOptions,
): Promise<string> => {
  const { name, daysSinceLastPost } = options

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

  const task =
    'Could you please write a very short message (2 sentences max) that I can ask them? Please be informal and casual, but also funny.'

  const defaultPrompt = `Hey ${name}, what have you been working today?`

  const userPrompt = `${concern} ${relation}, ${name}, ${role}. ${action} ${question}. ${task}`

  try {
    const response = await openai.chat.completions.create({
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

export { generateReminder }

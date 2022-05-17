import { Configuration, OpenAIApi } from 'openai'

import { OPENAI_API_KEY } from './constants.js'

const configuration = new Configuration({ apiKey: OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

const pick = (array: string[]): string => {
  if (array.length === 0) {
    throw new Error('array.length must be >= 1')
  }

  return array[Math.floor(Math.random() * array.length)]!
}

type GenerateReminderOptions = {
  name: string
}

const generateReminder = async (
  options: GenerateReminderOptions,
): Promise<string> => {
  const { name } = options

  const concern = pick([
    'You are a little worried about',
    'You are concerned about',
    'You are looking forward to hearing about',
    'You are excited to hear about',
  ])

  const relation = pick([
    'your colleague',
    'your friend',
    'your mate',
    'your fellow human',
  ])

  const role = pick([
    'who is an engineer',
    'who is a software developer',
    'who works for Runn',
    'who is an amazing person',
    'who is your best friend',
  ])

  const action = pick([
    'You send them a text message to ask',
    'You call them on the phone to ask',
    'You ask them a question about',
  ])

  const question = pick([
    'how they are going',
    'what they are up to',
    'how they are feeling',
    'how is their day going',
  ])

  const prompt = `${concern} ${relation}, ${name}, ${role}. ${action} ${question}.\n You: "`
  console.log(prompt)

  const response = await openai.createCompletion('text-davinci-002', {
    prompt,
    temperature: 1,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  })

  console.log(response.data.choices)

  const text = response.data.choices?.[0]?.text
    ?.trim()
    .split('\n')?.[0]
    ?.replace(/".?$/, '')

  if (!text) {
    return `Hey ${name}, what have you been working today?`
  }

  return text
}

export { generateReminder }

import { Configuration, OpenAIApi } from 'openai'

import { OPENAI_API_KEY } from './constants.js'

const configuration = new Configuration({ apiKey: OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

type GenerateReminderOptions = {
  name: string
}

const generateReminder = async (
  options: GenerateReminderOptions,
): Promise<string> => {
  const { name } = options

  const response = await openai.createCompletion('text-davinci-002', {
    prompt: `You work at a software company. It is the end of the work day and you need to know what your colleague, ${name}, is working on. You urgently send them a text message. The message says "`,
    temperature: 1,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  })

  const text = response.data.choices?.[0]?.text
    ?.split('\n')?.[0]
    ?.replace(/".?$/, '')
  if (!text) {
    return `Hey ${name}, what have you been working today?`
  }

  return text
}

export { generateReminder }

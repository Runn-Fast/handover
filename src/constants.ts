import * as z from 'zod'

const schema = z.object({
  SLACK_BOT_TOKEN: z.string(),
  SLACK_APP_TOKEN: z.string(),
  SLACK_SIGNING_SECRET: z.string(),
  PORT: z.number().int().min(0).max(65_535).default(8742),
  HANDOVER_CHANNEL: z.string(),
  HANDOVER_TITLE: z.string(),
  OPENAI_API_KEY: z.optional(z.string()),
})

const config = schema.parse(process.env)

export const SLACK_APP_TOKEN = config.SLACK_APP_TOKEN
export const SLACK_BOT_TOKEN = config.SLACK_BOT_TOKEN
export const SLACK_SIGNING_SECRET = config.SLACK_SIGNING_SECRET
export const PORT = config.PORT
export const HANDOVER_CHANNEL = config.HANDOVER_CHANNEL
export const HANDOVER_TITLE = config.HANDOVER_TITLE
export const OPENAI_API_KEY = config.OPENAI_API_KEY

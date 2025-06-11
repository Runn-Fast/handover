import process from 'node:process'
import * as z from 'zod'

const schema = z.object({
  SLACK_BOT_TOKEN: z.string(),
  SLACK_APP_TOKEN: z.string(),
  SLACK_SIGNING_SECRET: z.string(),
  PORT: z.preprocess(
    (argument) => Number.parseInt(String(argument), 10),
    z.number().int().min(0).max(65_535).default(8742),
  ),
  HANDOVER_CHANNEL: z.string(),
  HANDOVER_TITLE: z.string(),
  HANDOVER_DAILY_REMINDER_TIME: z
    .string()
    .regex(/^\d\d:\d\d$/)
    .default('17:00'),
  OPENAI_API_KEY: z.optional(z.string()),
})

const config = schema.parse(process.env)

export const { SLACK_APP_TOKEN } = config
export const { SLACK_BOT_TOKEN } = config
export const { SLACK_SIGNING_SECRET } = config
export const { PORT } = config
export const { HANDOVER_CHANNEL } = config
export const { HANDOVER_TITLE } = config
export const { HANDOVER_DAILY_REMINDER_TIME } = config
export const { OPENAI_API_KEY } = config

import envSchema from 'env-schema'
import { Static, Type } from '@sinclair/typebox'

const schema = Type.Strict(
  Type.Object({
    SLACK_BOT_TOKEN: Type.String(),
    SLACK_APP_TOKEN: Type.String(),
    SLACK_SIGNING_SECRET: Type.String(),
    PORT: Type.Integer({ default: 3000, minimum: 0, maximum: 65_535 }),
    HANDOVER_CHANNEL: Type.String(),
    HANDOVER_TITLE: Type.String(),
    OPENAI_API_KEY: Type.Optional(Type.String()),
  }),
)

const config = envSchema<Static<typeof schema>>({
  schema,
  dotenv: true,
})

export const SLACK_APP_TOKEN = config.SLACK_APP_TOKEN
export const SLACK_BOT_TOKEN = config.SLACK_BOT_TOKEN
export const SLACK_SIGNING_SECRET = config.SLACK_SIGNING_SECRET
export const PORT = config.PORT
export const HANDOVER_CHANNEL = config.HANDOVER_CHANNEL
export const HANDOVER_TITLE = config.HANDOVER_TITLE
export const OPENAI_API_KEY = config.OPENAI_API_KEY

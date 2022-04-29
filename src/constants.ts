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
    HANDOVER_USERS: Type.String(),
  }),
)

const config = envSchema<Static<typeof schema>>({
  schema,
  dotenv: true,
})

console.log(config)

const {
  SLACK_APP_TOKEN,
  SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET,
  PORT,
  HANDOVER_CHANNEL,
  HANDOVER_TITLE,
  HANDOVER_USERS,
} = config

export {
  SLACK_BOT_TOKEN,
  SLACK_APP_TOKEN,
  SLACK_SIGNING_SECRET,
  PORT,
  HANDOVER_CHANNEL,
  HANDOVER_TITLE,
  HANDOVER_USERS,
}

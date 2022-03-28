import dotenv from 'dotenv'
import env from 'env-var'

import { TeamConfig } from './types.js'

dotenv.config()

const SLACK_BOT_TOKEN = env.get('SLACK_BOT_TOKEN').required().asString()
const SLACK_APP_TOKEN = env.get('SLACK_APP_TOKEN').required().asString()

const SLACK_CHANNEL = env.get('SLACK_CHANNEL').required().asString()

const SLACK_SIGNING_SECRET = env
  .get('SLACK_SIGNING_SECRET')
  .required()
  .asString()

const PORT = env.get('PORT').default('3000').required().asPortNumber()

const HANDOVER_CONFIG: TeamConfig[] = env
  .get('HANDOVER_CONFIG')
  .required()
  .asJsonArray()

const CACHE_DIR = env.get('CACHE_DIR').default('/tmp/handover').asString()

export {
  PORT,
  HANDOVER_CONFIG,
  SLACK_BOT_TOKEN,
  SLACK_APP_TOKEN,
  SLACK_CHANNEL,
  SLACK_SIGNING_SECRET,
  CACHE_DIR,
}

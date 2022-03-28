import Bolt from '@slack/bolt'
import Pushable from 'pull-pushable'

import { Message } from '../types.js'

const createMessageSource = async (app: Bolt.App) => {
  const p = Pushable<Message>()

  app.event('message', async ({ payload }) => {
    p.push(payload)
  })

  app.event('reaction_added', async (message) => {
    console.log(message)
  })

  app.error(async (error) => {
    console.error(error)
  })

  app.start()

  return p
}

export { createMessageSource }

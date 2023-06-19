import type Bolt from '@slack/bolt'
import PQueue from 'p-queue'
import type { OnMessageFn } from './types.js'

const listenToMessage = async (
  app: Bolt.App,
  onMessage: OnMessageFn,
): Promise<void> => {
  const queue = new PQueue({ concurrency: 1 })

  app.event('message', async (event) => {
    const { payload, context } = event
    queue.add(async () => onMessage(payload, context))
  })

  app.event('reaction_added', async (message) => {
    console.log(message)
  })

  app.error(async (error) => {
    console.error(error)
  })

  await app.start()
}

export { listenToMessage }

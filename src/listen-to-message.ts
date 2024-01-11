import type Bolt from '@slack/bolt'
import PQueue from 'p-queue'
import type { OnMessageFn } from './types.js'

const listenToMessage = async (
  app: Bolt.App,
  onMessage: OnMessageFn,
): Promise<void> => {
  const queue = new PQueue({ concurrency: 1 })

  app.event('message', async (event) => {
    try {
      const { payload, context } = event
      await queue.add(async () => onMessage(payload, context))
    } catch (error) {
      console.error('Error from listenToMessage')
      console.error('==========================')
      console.error(error)
      console.error('==========================')
      console.error(JSON.stringify(event))
      console.error('==========================')
    }
  })

  app.error(async (error) => {
    console.error(error)
  })

  await app.start()
}

export { listenToMessage }

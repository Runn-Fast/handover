import Bolt, { KnownEventFromType } from '@slack/bolt'
import PQueue from 'p-queue'

type Message = KnownEventFromType<'message'>
type OnMessageFn = (message: Message) => Promise<void> | void

const listenToMessage = async (
  app: Bolt.App,
  onMessage: OnMessageFn,
): Promise<void> => {
  const queue = new PQueue({ concurrency: 1 })

  app.event('message', async ({ payload }) =>
    queue.add(() => onMessage(payload)),
  )

  app.event('reaction_added', async (message) => {
    console.log(message)
  })

  app.error(async (error) => {
    console.error(error)
  })

  await app.start()
}

export { listenToMessage }

import type { WebClient, WebAPIPlatformError } from '@slack/web-api'
import { errorBoundary } from '@stayradiated/error-boundary'

type PublishPublicContentToSlackOptions = {
  web: WebClient
  channel: string
  ts: string | undefined
  text: string
}

const publishPublicContentToSlack = async (
  options: PublishPublicContentToSlackOptions,
): Promise<string | Error> => {
  const { web, channel, ts, text } = options

  if (!ts) {
    const result = await errorBoundary(async () =>
      web.chat.postMessage({
        channel,
        text,
        unfurl_links: false,
      }),
    )
    if (result instanceof Error) {
      return result
    }

    return result.ts!
  }

  try {
    const result = await errorBoundary(async () =>
      web.chat.update({
        ts,
        channel,
        text,
      }),
    )
    if (result instanceof Error) {
      return result
    }

    return ts
  } catch (error: unknown) {
    if ((error as WebAPIPlatformError)?.data?.error === 'message_not_found') {
      return publishPublicContentToSlack({ web, channel, text, ts: undefined })
    }

    if (error instanceof Error) {
      return error
    }

    return new Error(String(error))
  }
}

type PublishPrivateContentToSlackOptions = {
  web: WebClient
  userId: string
  text: string
}

const publishPrivateContentToSlack = async (
  options: PublishPrivateContentToSlackOptions,
): Promise<string | Error> => {
  const { web, userId, text } = options

  const message = await errorBoundary(async () =>
    web.chat.postMessage({
      channel: userId,
      text,
      unfurl_links: false,
    }),
  )
  if (message instanceof Error) {
    return message
  }

  return message.ts!
}

export { publishPublicContentToSlack, publishPrivateContentToSlack }

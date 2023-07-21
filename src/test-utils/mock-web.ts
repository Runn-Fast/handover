import { type WebClient } from '@slack/web-api'

const mockWeb = (): WebClient => {
  return undefined as unknown as WebClient
}

export { mockWeb }

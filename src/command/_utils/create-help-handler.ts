import type { WebClient } from '@slack/web-api'
import type { CommandDefinition } from 'cilly'
import { publishPrivateContentToSlack } from '../../publish-to-slack.js'
import { formatCommandDefinition } from './cilly-show-help.js'

type CreateHelpHandlerOptions = {
  web: WebClient
  userId: string
}

const createHelpHandler = (options: CreateHelpHandlerOptions) => {
  const { web, userId } = options
  const helpHandler = async (command: CommandDefinition): Promise<void> => {
    await publishPrivateContentToSlack({
      web,
      userId,
      text: formatCommandDefinition(command),
    })
  }

  return helpHandler
}

export { createHelpHandler }

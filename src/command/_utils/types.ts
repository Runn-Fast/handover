import type { CliCommand } from 'cilly'
import type { WebClient } from '@slack/web-api'

export type CreateCmdOptions = {
  web: WebClient
  userId: string
}

export type CreateCmdFunction = (options: CreateCmdOptions) => CliCommand

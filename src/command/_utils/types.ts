import type { CliCommand } from 'cilly'
import type { WebClient } from '@slack/web-api'

export type CreateCmdOptions = {
  web: WebClient
  userId: string
}

export type CreateCmdFn = (options: CreateCmdOptions) => CliCommand

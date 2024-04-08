import type { WebClient } from '@slack/web-api'
import type { Action } from '../types.js'
import { publishPrivateContentToSlack } from '../publish-to-slack.js'
import { parseShellArgs } from './_utils/parse-shell-args.js'
import { createHandoverCommand } from './cli.js'

type ExecCommandOptions = {
  web: WebClient
  action: Action
}

const execCommand = async (options: ExecCommandOptions) => {
  const { web, action } = options

  const arguments_ = parseShellArgs(
    action.text.replace(/^<@\w{10,}>/, '').trim(),
  )

  console.log(arguments_)

  // Process.argv is [node, handover, ...args]
  arguments_.unshift('node')
  arguments_.unshift('handover')

  const handoverCmd = createHandoverCommand({
    web,
    userId: action.userId,
  })

  try {
    await handoverCmd.process(arguments_)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error)
    await publishPrivateContentToSlack({
      web,
      userId: action.userId,
      text: `⚠️ ${errorMessage}`,
    })
  }
}

export { execCommand }

export { isCommand } from './_utils/is-command.js'

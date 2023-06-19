import type { WebClient } from '@slack/web-api'
import { CliCommand } from 'cilly'
import type { Action } from './types.js'
import { publishPrivateContentToSlack } from './publish-to-slack.js'
import { setFormat, listFormats, deleteFormat } from './format.js'
import { createShowHelp } from './cilly-show-help.js'

type CreateHandoverCommandOptions = {
  web: WebClient
  userId: string
}

const createHandoverCommand = (
  options: CreateHandoverCommandOptions,
): CliCommand => {
  const { web, userId } = options
  const showHelp = createShowHelp(web, userId)

  const formatSetCmd = new CliCommand('set')
    .withArguments(
      {
        name: 'id',
        required: true,
      },
      {
        name: 'pattern',
        required: true,
      },
      {
        name: 'replacement',
        required: true,
      },
    )
    .withOptions({
      name: ['-d', '--description'],
      args: [{ name: 'text', required: true }],
    })
    .withHelpHandler(showHelp)
    .withHandler(async (args, options) => {
      const { id, pattern, replacement } = args
      const { description } = options

      const response = await setFormat({
        id,
        pattern,
        replacement,
        userId,
        description,
      })

      await publishPrivateContentToSlack({
        web,
        userId,
        text: response,
      })
    })

  const formatDeleteCmd = new CliCommand('delete')
    .withArguments({
      name: 'id',
      required: true,
    })
    .withHelpHandler(showHelp)
    .withHandler(async (args) => {
      const { id } = args

      const response = await deleteFormat({ id })

      await publishPrivateContentToSlack({
        web,
        userId,
        text: response,
      })
    })

  const formatListCmd = new CliCommand('list')
    .withHelpHandler(showHelp)
    .withHandler(async () => {
      const response = await listFormats({})

      await publishPrivateContentToSlack({
        web,
        userId,
        text: response,
      })
    })

  const formatCmd = new CliCommand('format')
    .withSubCommands(formatListCmd, formatSetCmd, formatDeleteCmd)
    .withHelpHandler(showHelp)
    .withHandler(() => {
      formatCmd.help()
    })

  const handoverCmd = new CliCommand('handover')
    .withSubCommands(formatCmd)
    .withHelpHandler(showHelp)
    .withHandler(() => {
      formatCmd.help()
    })

  return handoverCmd
}

type IsCommandOptions = {
  botUserId: string
  text: string
}
const isCommand = (options: IsCommandOptions): boolean => {
  const { botUserId, text } = options
  return text.startsWith(`<@${botUserId}>`)
}

// Split on spaces but keep "...", '...' or `...` together
const shellArgsRegExp = /"[^"]+"|'[^']+'|`[^`]+`|\S+/g
const parseShellArgs = (input: string): string[] => {
  return (input.match(shellArgsRegExp) || []).map((arg) => {
    const firstChar = arg[0] ?? ''
    const lastChar = arg[arg.length - 1] ?? ''
    if (firstChar === lastChar && ['"', "'", '`'].includes(firstChar)) {
      return arg.slice(1, -1)
    }

    return arg
  })
}

type HandleCommandOptions = {
  web: WebClient
  action: Action
}

const handleCommand = async (options: HandleCommandOptions) => {
  const { web, action } = options

  const args = parseShellArgs(action.text.replace(/^<@\w{10,}>/, '').trim())

  console.log(args)

  // Process.argv is [node, handover, ...args]
  args.unshift('node')
  args.unshift('handover')

  const handoverCmd = createHandoverCommand({
    web,
    userId: action.userId,
  })

  try {
    await handoverCmd.process(args)
  } catch (error) {
    let errorMessage: string
    errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error)
    await publishPrivateContentToSlack({
      web,
      userId: action.userId,
      text: `⚠️ ${errorMessage}`,
    })
  }
}

export { isCommand, handleCommand }

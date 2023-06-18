import type { WebClient } from '@slack/web-api'
import { CliCommand } from 'cilly'
import type {
  ArgumentDefinition,
  CommandDefinition,
  OptionDefinition,
} from 'cilly'
import { getNegatedFlag } from 'cilly/dist/tokens/token-parser.js'
import type { Action } from './types.js'
import { publishPrivateContentToSlack } from './publish-to-slack.js'
import { setFormat, listFormats, deleteFormat } from './format.js'

/* https://github.com/cilly-cli/cilly - src/presentation.ts */

const padToLength = (string_: string, length: number): string => {
  const padding = length - string_.length
  string_ += ' '.repeat(padding)
  return string_
}

const formatArguments = (args: ArgumentDefinition[]): string => {
  const argStrings: string[] = []
  for (const arg of args) {
    let argString = arg.name
    if (arg.variadic) {
      argString = `...${argString}`
    }

    argString = arg.required ? `<${argString}>` : `[${argString}]`
    argStrings.push(argString)
  }

  return argStrings.length > 0 ? argStrings.join(' ') + ' ' : ''
}

const formatOptions = (options: OptionDefinition[]): string => {
  const padding = 4
  let maxOptionLength = 0
  const optStrings: string[] = []

  // Generate option definition string, max length for justification
  for (const opt of options) {
    let optString = `  ${opt.name[0]}, ${opt.name[1]}`
    if (opt.args.length > 0) {
      optString += ` ${formatArguments(opt.args)}`
    }

    if (opt.negatable) {
      optString += ` (${getNegatedFlag(opt.name[1])})`
    }

    if (optString.length > maxOptionLength) {
      maxOptionLength = optString.length
    }

    optStrings.push(optString)
  }

  for (const [i, option] of options.entries()) {
    const opt = option
    let optString = optStrings[i]!
    optString = padToLength(optString, maxOptionLength + padding)

    if (opt.required) {
      optString += ' (required)'
    }

    if (opt.description) {
      optString += ` ${opt.description}`
    }

    if (opt.defaultValue !== undefined) {
      optString += ` (default: ${JSON.stringify(opt.defaultValue)})`
    }

    optStrings[i] = optString
  }

  return optStrings.join('\n')
}

const formatCommandUsage = (command: CommandDefinition): string => {
  return `${command.name} ${formatArguments(command.args)}[options]`
}

const formatSubCommands = (subCommands: CommandDefinition[]): string => {
  return subCommands.map((c) => `  ${formatCommandUsage(c)}`).join('\n')
}

const formatCommandDefinition = (command: CommandDefinition): string => {
  let output = `Usage: ${formatCommandUsage(command)}` + '\n\n'

  if (command.description) {
    output += command.description + '\n\n'
  }

  if (command.opts.length > 0) {
    output += `Options:\n${formatOptions(command.opts)}\n\n`
  }

  if (command.subCommands.length > 0) {
    output += `Commands:\n${formatSubCommands(command.subCommands)}\n\n`
  }

  return output
}

const createShowHelp = (web: WebClient, userId: string) => {
  const showHelp = async (command: CommandDefinition): Promise<void> => {
    await publishPrivateContentToSlack({
      web,
      userId,
      text: formatCommandDefinition(command),
    })
  }

  return showHelp
}

const stripQuotes = (string_: string): string => {
  if (string_.startsWith('`') && string_.endsWith('`')) {
    return string_.slice(1, -1)
  }

  return string_
}

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
        variadic: true,
        required: true,
      },
    )
    .withHelpHandler(showHelp)
    .withHandler(async (args) => {
      const {
        id: idRaw,
        pattern: patternRaw,
        replacement: replacementRaw,
      } = args

      const id = stripQuotes(idRaw)
      const pattern = stripQuotes(patternRaw)
      const replacement = stripQuotes(replacementRaw.join(' '))

      const response = await setFormat({ id, pattern, replacement, userId })

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
      const { id: idRaw } = args

      const id = stripQuotes(idRaw)

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

const cmdPrefix = '<@U038H6X4CJK>'

const isCommand = (text: string): boolean => {
  return text.startsWith(cmdPrefix)
}

// Split on spaces but keep "..." or '...' together
// https://stackoverflow.com/a/29656458
const shellArgsRegExp = /"[^"]+"|'[^']+'|\S+/g
const parseShellArgs = (input: string): string[] => {
  return input.match(shellArgsRegExp) || []
}

type HandleCommandOptions = {
  web: WebClient
  action: Action
}

const handleCommand = async (options: HandleCommandOptions) => {
  const { web, action } = options

  const args = parseShellArgs(action.text.replace(cmdPrefix, '').trim())

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

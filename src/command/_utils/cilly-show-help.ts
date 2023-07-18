import type {
  ArgumentDefinition,
  CommandDefinition,
  OptionDefinition,
} from 'cilly'
import { getNegatedFlag } from 'cilly/dist/tokens/token-parser.js'

/*
 * Fork of src/presentation.ts from github.com/cilly-cli/cilly
 *
 * But instead of printing to stdout, it sends the help text to the user.
 */

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
  let output = `Usage: ${formatCommandUsage(command)}\n\n`

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

export { formatCommandDefinition }

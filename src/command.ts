import type { WebClient } from '@slack/web-api'
import { CliCommand } from 'cilly'
import type { Action } from './types.js'
import { publishPrivateContentToSlack } from './publish-to-slack.js'
import { setFormat, listFormats, deleteFormat } from './format.js'
import { createShowHelp } from './cilly-show-help.js'
import {
  dailyReminderDefaultHandler,
  dailyReminderTimeUpdateHandler,
  dayOffHandler,
  dayOffValidator,
} from './command-handler.js'
import { deleteUserDailyReminderDayOff } from './db.js'

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

  const deleteDayOffCmd = new CliCommand('deleteDayOff')
    .withHelpHandler(showHelp)
    .withHandler(async (_args) => {
      const response = await deleteUserDailyReminderDayOff({ userId })

      if (response instanceof Error) {
        await publishPrivateContentToSlack({
          web,
          userId,
          text: `⚠️ Error:\n${response}`,
        })
        return
      }

      await publishPrivateContentToSlack({
        web,
        userId,
        text: '✅ Your day off has been deleted successfully. No worries!',
      })
    })

  const remindCmd = new CliCommand('remind')
    .withSubCommands(deleteDayOffCmd)
    .withDescription('Remind me to post my handover')
    .withHelpHandler(showHelp)
    .withOptions(
      {
        description: 'Time of day to send the reminder',
        name: ['-t', '--at'],
        args: [{ name: 'time' }],
      },
      {
        description:
          'Specify your day off to snooze the reminder ( 1 | 2 | 3 | 4 | 5 ) where 1 is Monday',
        name: ['-d', '--day-off'],
        args: [{ name: 'dayOff' }],
      },
    )
    .withHandler(async (_args, options) => {
      const { at: dailyReminderTime, dayOff } = options

      if (!dailyReminderTime && !dayOff) {
        await dailyReminderDefaultHandler({ userId, web })
        return
      }

      if (dailyReminderTime && typeof dailyReminderTime === 'string') {
        const error = await dailyReminderTimeUpdateHandler({
          userId,
          dailyReminderTime,
          web,
        })

        if (error) {
          await publishPrivateContentToSlack({
            web,
            userId,
            text: `⚠️ ${error}`,
          })
        }
      }

      if (dayOff) {
        const result = dayOffValidator(dayOff)

        if (typeof result === 'string') {
          await publishPrivateContentToSlack({
            web,
            userId,
            text: `⚠️ ${result}`,
          })
          return
        }

        dayOffHandler({ userId, dayOff, web })
      }
    })

  const handoverCmd = new CliCommand('handover')
    .withSubCommands(formatCmd, remindCmd)
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

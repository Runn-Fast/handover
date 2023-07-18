import type { WebClient } from '@slack/web-api'
import { CliCommand } from 'cilly'
import type { Action } from './types.js'
import { publishPrivateContentToSlack } from './publish-to-slack.js'
import {
  setFormat,
  listFormats,
  deleteFormat,
  getFormatFnList,
} from './format.js'
import {
  updateUserDailyReminderTime,
  getUserDailyReminderTime,
  getPostsWithItemsForPeriod,
} from './db.js'
import { createShowHelp } from './cilly-show-help.js'
import { HANDOVER_DAILY_REMINDER_TIME } from './constants.js'
import { formatPostAsText } from './format-post-as-text.js'

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

  const remindCmd = new CliCommand('remind')
    .withDescription('Remind me to post my handover')
    .withOptions({
      description: 'Time of day to send the reminder',
      name: ['-t', '--at'],
      args: [{ name: 'time' }],
    })
    .withHelpHandler(showHelp)
    .withHandler(async (_args, options) => {
      const { at: dailyReminderTime } = options

      if (typeof dailyReminderTime === 'string') {
        const result = await updateUserDailyReminderTime({
          userId,
          dailyReminderTime,
        })
        if (result instanceof Error) {
          throw result
        }

        await publishPrivateContentToSlack({
          web,
          userId,
          text: `Ok, I will remind you each week day at ${dailyReminderTime}`,
        })
      } else {
        const dailyReminderTime = await getUserDailyReminderTime({ userId })
        if (dailyReminderTime instanceof Error) {
          throw dailyReminderTime
        }

        if (dailyReminderTime) {
          await publishPrivateContentToSlack({
            web,
            userId,
            text: `You will be reminded each week day at ${dailyReminderTime}`,
          })
        } else {
          await publishPrivateContentToSlack({
            web,
            userId,
            text: `You will be reminded each week day at the default time of ${HANDOVER_DAILY_REMINDER_TIME}`,
          })
        }
      }
    })

  const historyCmd = new CliCommand('history')
    .withDescription('Fetch a list of previous handover posts')
    .withOptions({
      name: ['-d', '--daysBefore'],
      description: 'Number of days before to fetch handover posts',
      defaultValue: 7,
      args: [
        {
          name: 'daysBefore',
          required: false,
        },
      ],
    })
    .withHelpHandler(showHelp)
    .withHandler(async (_args, options) => {
      const { daysBefore } = options
      const daysBeforeInNumber = parseInt(daysBefore, 10)

      if (daysBeforeInNumber > 30) {
        await publishPrivateContentToSlack({
          web,
          userId,
          text: "You're pushing it, human. We can't fetch more than 30 days of history!",
        })
        return
      }

      const result = await getPostsWithItemsForPeriod({
        userId,
        daysBefore: daysBeforeInNumber,
      })

      if (result instanceof Error) {
        throw result
      }

      if (result.length === 0) {
        await publishPrivateContentToSlack({
          web,
          userId,
          text: `Check it out! Looks like you had a solid break. We can't find any handover posts in the last ${daysBefore} day(s).`,
        })
        return
      }

      const formatFnList = await getFormatFnList()
      const text = result
        .map((post) => {
          if (post.items.length === 0) {
            return
          }

          return `${formatPostAsText({
            post: { ...post, title: post.date.toLocaleDateString() },
            formatFnList,
          })}`
        })
        .join('\n')

      await publishPrivateContentToSlack({
        web,
        userId,
        text: `Good stuff! This is what you've been up to in the last ${daysBefore} day(s): \n\n${text}`,
      })
    })

  const handoverCmd = new CliCommand('handover')
    .withSubCommands(formatCmd, remindCmd, historyCmd)
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

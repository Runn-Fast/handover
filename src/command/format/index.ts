import { CliCommand } from 'cilly'
import { createHelpHandler } from '../_utils/create-help-handler.js'
import type { CreateCmdFn } from '../_utils/types.js'
import { createFormatListCmd } from './list/index.js'
import { createFormatSetCmd } from './set/index.js'
import { createFormatDeleteCmd } from './delete/index.js'

const createFormatCmd: CreateCmdFn = (context) => {
  const formatListCmd = createFormatListCmd(context)
  const formatSetCmd = createFormatSetCmd(context)
  const formatDeleteCmd = createFormatDeleteCmd(context)

  const formatCmd = new CliCommand('format')
    .withHelpHandler(createHelpHandler(context))
    .withSubCommands(formatListCmd, formatSetCmd, formatDeleteCmd)
    .withHandler(() => {
      formatCmd.help()
    })

  return formatCmd
}

export { createFormatCmd }

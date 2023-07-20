import { CliCommand } from 'cilly'
import { createFormatCmd } from './format/index.js'
import { createRemindCmd } from './remind/index.js'
import { createHistoryCmd } from './history/index.js'
import type { CreateCmdFn } from './_utils/types.js'
import { createHelpHandler } from './_utils/create-help-handler.js'
import { createWorkdaysCmd } from './workdays/index.js'

const createHandoverCommand: CreateCmdFn = (context) => {
  const { web, userId } = context

  const formatCmd = createFormatCmd(context)
  const remindCmd = createRemindCmd(context)
  const historyCmd = createHistoryCmd(context)
  const workdaysCmn = createWorkdaysCmd(context)

  const handoverCmd = new CliCommand('handover')
    .withSubCommands(formatCmd, remindCmd, historyCmd, workdaysCmn)
    .withHelpHandler(createHelpHandler({ web, userId }))
    .withHandler(() => {
      handoverCmd.help()
    })

  return handoverCmd
}

export { createHandoverCommand }

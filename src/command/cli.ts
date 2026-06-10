import { CliCommand } from 'cilly'
import { createFormatCmd } from './format/index.js'
import { createRemindCmd } from './remind/index.js'
import { createHistoryCmd } from './history/index.js'
import type { CreateCmdFunction } from './_utils/types.js'
import { createHelpHandler } from './_utils/create-help-handler.js'
import { createWorkdaysCmd } from './workdays/index.js'
import { createConversationStyleCmd } from './conversation-style/index.js'

const createHandoverCommand: CreateCmdFunction = (context) => {
  const { web, userId } = context

  const formatCmd = createFormatCmd(context)
  const remindCmd = createRemindCmd(context)
  const historyCmd = createHistoryCmd(context)
  const workdaysCmn = createWorkdaysCmd(context)
  const conversationStyleCmd = createConversationStyleCmd(context)

  const handoverCmd = new CliCommand('handover')
    .withSubCommands(
      formatCmd,
      remindCmd,
      historyCmd,
      workdaysCmn,
      conversationStyleCmd,
    )
    .withHelpHandler(createHelpHandler({ web, userId }))
    .withHandler(() => {
      handoverCmd.help()
    })

  return handoverCmd
}

export { createHandoverCommand }

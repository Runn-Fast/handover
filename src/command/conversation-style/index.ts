import { CliCommand } from 'cilly'
import { z } from 'zod'
import { publishPrivateContentToSlack } from '../../publish-to-slack.js'
import { getUser, updateUser } from '../../db/index.js'
import type { CreateCmdFunction } from '../_utils/types.js'
import { createHelpHandler } from '../_utils/create-help-handler.js'
import {
  formatConversationStyleList,
  parseConversationStyle,
} from '../../conversation-style.js'

const $ConversationStyleCmdArguments = z.object({
  style: z.string().optional(),
})

const createConversationStyleCmd: CreateCmdFunction = (context) => {
  const { web, userId } = context

  const conversationStyleCmd = new CliCommand('conversation-style')
    .withHelpHandler(createHelpHandler(context))
    .withDescription('Choose the tone used for your reminder DMs')
    .withArguments({
      name: 'style',
      required: false,
    })
    .withHandler(async (anyArguments) => {
      const { style } = $ConversationStyleCmdArguments.parse(anyArguments)

      if (style) {
        const conversationStyle = parseConversationStyle(style)
        if (conversationStyle instanceof Error) {
          throw conversationStyle
        }

        const user = await updateUser({
          userId,
          data: {
            conversationStyle,
          },
        })
        if (user instanceof Error) {
          throw user
        }

        await publishPrivateContentToSlack({
          web,
          userId,
          text: `✅ Sounds good, your reminder conversation style is now \`${user.conversationStyle}\`.`,
        })
        return
      }

      const user = await getUser({ userId })
      if (user instanceof Error) {
        throw user
      }

      await publishPrivateContentToSlack({
        web,
        userId,
        text: `Your reminder conversation style is currently \`${user.conversationStyle}\`.\n\nAvailable styles:\n${formatConversationStyleList()}`,
      })
    })

  return conversationStyleCmd
}

export { createConversationStyleCmd }

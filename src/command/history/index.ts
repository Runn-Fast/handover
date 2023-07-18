import { CliCommand } from 'cilly'
import { z } from 'zod'
import * as dateFnsTz from 'date-fns-tz'
import * as dateFns from 'date-fns'
import { publishPrivateContentToSlack } from '../../publish-to-slack.js'
import { getFormatFnList } from '../../format.js'
import { getUser, getPostListWithItems } from '../../db/index.js'
import { formatPostAsText } from '../../format-post-as-text.js'
import type { CreateCmdFn } from '../_utils/types.js'
import { createHelpHandler } from '../_utils/create-help-handler.js'

const $HistoryCmdOptions = z.object({
  daysBefore: z.coerce.number(),
})

const createHistoryCmd: CreateCmdFn = (context) => {
  const { web, userId } = context

  const historyCmd = new CliCommand('history')
    .withHelpHandler(createHelpHandler(context))
    .withDescription('Fetch a list of previous handover posts')
    .withOptions({
      name: ['-d', '--days-before'],
      description: 'Number of days before to fetch handover posts',
      defaultValue: 7,
      args: [{ name: 'days', required: false }],
    })
    .withHandler(async (_args, anyOptions) => {
      const { daysBefore } = $HistoryCmdOptions.parse(anyOptions)

      if (daysBefore > 30) {
        await publishPrivateContentToSlack({
          web,
          userId,
          text: "You're pushing it, human. We can't fetch more than 30 days of history!",
        })
        return
      }

      const user = await getUser({ userId })
      if (user instanceof Error) {
        throw user
      }

      const result = await getPostListWithItems({
        userId,
        startDate: dateFns.subDays(new Date(), daysBefore),
        endDate: new Date(),
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

          const title = dateFnsTz.formatInTimeZone(
            post.date,
            user.timeZone,
            'PPPP',
          )

          return `${formatPostAsText({
            post: { ...post, title },
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

  return historyCmd
}

export { createHistoryCmd }

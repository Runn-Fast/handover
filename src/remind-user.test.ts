import test from 'ava'
import * as td from 'testdouble'
import { WebClient } from '@slack/web-api'

const web = 'web-client' as unknown as WebClient

test('sendReminderToUser', async (t) => {
  const { upsertReminder } = await td.replaceEsm('./db.js')
  const { publishPrivateContentToSlack } = await td.replaceEsm(
    './publish-to-slack.js',
  )
  const { generateReminder } = await td.replaceEsm('./ai.js')

  const { sendReminderToUser } = await import('./remind-user.js')

  td.when(
    generateReminder({
      name: 'User Name',
      daysSinceLastPost: 3,
    }),
  ).thenResolve('reminder text')

  td.when(
    publishPrivateContentToSlack({
      web,
      userId: 'user-id-1',
      text: 'reminder text',
    }),
  ).thenResolve('message-ts')

  await sendReminderToUser({
    web,
    user: {
      id: 'user-id-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'User Name',
      timeZone: 'Europe/London',
      posts: [
        {
          id: 1,
          title: 'title',
          channel: 'channel',
          ts: 'ts',
          userId: 'user-id-1',
          date: new Date('2022-08-15'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    userDate: '2022-08-19',
  })

  td.verify(
    upsertReminder({
      userId: 'user-id-1',
      date: '2022-08-19',
      text: 'reminder text',
      channel: 'user-id-1',
      ts: 'message-ts',
    }),
  )

  t.pass()
})

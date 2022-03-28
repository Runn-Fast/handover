import { WebClient, UsersListResponse } from '@slack/web-api'
import { scheduleJob } from 'node-schedule'
import Pushable from 'pull-pushable'

import { Team, TeamConfig, Action } from '../types.js'

type Options = {
  web: WebClient
  teams: TeamConfig[]
}

type Member = NonNullable<UsersListResponse['members']>[0]

const BUILTIN_USERS = ['Important']

const mapUserNameToId = (names: string[], allMembers: Member[]): string[] => {
  const userIds = names
    .map((rawName) => {
      const name = rawName.trim().toLowerCase()

      const member = allMembers.find((member) => {
        return (
          member?.name?.toLowerCase() === name ||
          member?.real_name?.toLowerCase() === name ||
          member?.profile?.display_name?.toLowerCase() === name
        )
      })

      if (member == null) {
        return null
      }

      return member.id
    })
    .filter((id) => id != null) as string[]

  return userIds
}

const createTeam = (teamConfig: TeamConfig, allMembers: Member[]): Team => {
  const { title, timezone, schedule, remindAt, users } = teamConfig

  if (typeof title !== 'string') {
    throw new TypeError('Invalid handover config: title must be a string')
  }

  if (typeof timezone !== 'string') {
    throw new TypeError('Invalid handover config: timezone must be a string')
  }

  if (typeof schedule !== 'string') {
    throw new TypeError('Invalid handover config: scheule must be a string')
  }

  if (typeof remindAt !== 'string') {
    throw new TypeError('Invalid handover config: remindAt must be a string')
  }

  if (!Array.isArray(users)) {
    throw new TypeError('Invalid handover config: users must be an array')
  }

  console.log(
    `${title} | ${timezone} | ${schedule} | ${remindAt} | ${users.join(', ')}`,
  )

  return {
    title,
    timezone,
    schedule,
    remindAt,
    users: mapUserNameToId(users, allMembers),
  }
}

const createActionSource = async (options: Options) => {
  const { web, teams } = options
  const { members } = await web.users.list()
  if (!members) {
    throw new Error('Could not get member list')
  }

  const p = Pushable<Action>()

  for (const team of teams.map((team) => createTeam(team, members))) {
    scheduleJob(
      {
        rule: team.remindAt,
        tz: team.timezone,
      },
      () => {
        for (const user of team.users) {
          p.push({
            type: 'REMIND',
            user,
          })
        }
      },
    )

    scheduleJob(
      {
        rule: team.schedule,
        tz: team.timezone,
      },
      () => {
        p.push({
          type: 'TITLE',
          user: '',
          userName: '',
          ts: '',
          text: team.title,
        })
        for (const user of [...BUILTIN_USERS, ...team.users]) {
          p.push({
            type: 'RESET',
            user,
            userName: user,
            ts: '',
            text: '',
          })
        }
      },
    )
  }

  return p
}

export default createActionSource

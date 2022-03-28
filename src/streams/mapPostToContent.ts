import { format } from 'date-fns'

import { assertNever } from '../assert.js'

import { RemindPost, HandoverPost, UserPost, Post, Content } from '../types.js'

const mapUserPostToContent = (post: UserPost): Content => {
  const { user, date, title, items } = post

  const lines = items
    .sort((a, b) => {
      return Number.parseInt(a.sourceTs, 10) - Number.parseInt(b.sourceTs, 10)
    })
    .flatMap((item) => {
      return item.text
        .trim()
        .replace(/^\s*-\s*/gm, '')
        .split('\n')
        .filter((line) => line.length > 0)
    })

  const formattedLines = lines.map((line) => `• ${line}`).join('\n')

  const text =
    formattedLines.length === 0
      ? `\n*${title}*\n_missing handover items_`
      : `\n*${title}*\n${formattedLines}`

  const id = `${user}.${date}`

  return {
    type: 'PUBLIC',
    id,
    text,
  }
}

const mapHandoverPostToContent = (post: HandoverPost): Content => {
  const { date, title } = post

  const formattedDate = format(new Date(date), 'PPPP')

  const text = `*${title} Handover for ${formattedDate}*`

  const id = `${title}_handover.${date}`

  return {
    type: 'PUBLIC',
    id,
    text,
  }
}

const mapRemindPostToContent = (post: RemindPost): Content => {
  const { user } = post

  const text = `Kia ora <@${user}>, just a friendly reminder to write your handover today.`

  return {
    type: 'PRIVATE',
    user,
    text,
  }
}

const mapPostToContent = (post: Post): Content => {
  switch (post.type) {
    case 'USER':
      return mapUserPostToContent(post)
    case 'HANDOVER':
      return mapHandoverPostToContent(post)
    case 'REMIND':
      return mapRemindPostToContent(post)
    default:
      return assertNever(post)
  }
}

export default mapPostToContent

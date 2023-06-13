import type { PostWithItems } from './db.js'

const lineStartsWithBullet = (line: string): boolean => {
  return /^\s*[•◦▪︎]/.test(line)
}

const formatPostAsText = (post: PostWithItems): string => {
  const { title, items } = post

  const lines = items.flatMap((item) =>
    item.text
      .trim()
      .replace(/^\s*-\s*/gm, '')
      .split('\n')
      .filter((line) => line.length > 0),
  )

  const formattedLines = lines
    .map((line) => {
      if (lineStartsWithBullet(line)) {
        return line
      }

      return `• ${line}`
    })
    .join('\n')

  const text =
    formattedLines.length === 0
      ? `\n_${title}_\n`
      : `\n*${title}*\n${formattedLines}`

  return text
}

export { formatPostAsText }

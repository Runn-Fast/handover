const conversationStyleList = [
  'standard',
  'basic',
  'humorous',
  'british',
  'kiwi',
  'unhinged',
] as const

type ConversationStyle = (typeof conversationStyleList)[number]

const defaultConversationStyle = 'standard' satisfies ConversationStyle

const conversationStyleDescriptionMap: Record<ConversationStyle, string> = {
  standard: 'current casual funny reminder',
  basic: 'simple fixed reminder without AI',
  humorous: 'light slapstick humor',
  british: 'old-timey British colloquial tone',
  kiwi: 'casual Kiwi slang',
  unhinged: 'chaotic and absurd, but workplace-safe',
}

const validConversationStyleList = conversationStyleList.join(' | ')

const isConversationStyle = (value: string): value is ConversationStyle => {
  return conversationStyleList.includes(value as ConversationStyle)
}

const parseConversationStyle = (value: string): ConversationStyle | Error => {
  const normalizedValue = value.trim().toLowerCase()

  if (isConversationStyle(normalizedValue)) {
    return normalizedValue
  }

  return new Error(
    `Invalid conversation style "${value}". Please use one of [ ${validConversationStyleList} ].`,
  )
}

const formatConversationStyleList = (): string => {
  return conversationStyleList
    .map((style) => {
      return `• \`${style}\`: ${conversationStyleDescriptionMap[style]}`
    })
    .join('\n')
}

export {
  conversationStyleList,
  defaultConversationStyle,
  conversationStyleDescriptionMap,
  formatConversationStyleList,
  parseConversationStyle,
}
export type { ConversationStyle }

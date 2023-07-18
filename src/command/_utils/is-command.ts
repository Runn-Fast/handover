type IsCommandOptions = {
  botUserId: string
  text: string
}
const isCommand = (options: IsCommandOptions): boolean => {
  const { botUserId, text } = options
  return text.startsWith(`<@${botUserId}>`)
}

export { isCommand }

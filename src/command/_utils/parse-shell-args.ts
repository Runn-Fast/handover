// Split on spaces but keep "...", '...' or `...` together
const shellArgsRegExp = /"[^"]+"|'[^']+'|`[^`]+`|\S+/g
const parseShellArgs = (input: string): string[] => {
  return (input.match(shellArgsRegExp) ?? []).map((arg) => {
    const firstChar = arg[0] ?? ''
    const lastChar = arg.at(-1) ?? ''
    if (firstChar === lastChar && ['"', "'", '`'].includes(firstChar)) {
      return arg.slice(1, -1)
    }

    return arg
  })
}

export { parseShellArgs }

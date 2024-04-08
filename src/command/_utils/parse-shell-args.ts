// Split on spaces but keep "...", '...' or `...` together
const shellArgumentsRegExp = /"[^"]+"|'[^']+'|`[^`]+`|\S+/g
const parseShellArguments = (input: string): string[] => {
  return (input.match(shellArgumentsRegExp) ?? []).map((argument) => {
    const firstChar = argument[0] ?? ''
    const lastChar = argument.at(-1) ?? ''
    if (firstChar === lastChar && ['"', "'", '`'].includes(firstChar)) {
      return argument.slice(1, -1)
    }

    return argument
  })
}

export { parseShellArguments as parseShellArgs }

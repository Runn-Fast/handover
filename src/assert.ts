import { inspect } from 'util'

const assertNever = (x: never): never => {
  throw new Error(`Unexpected object: ${inspect(x)}`)
}

export { assertNever }

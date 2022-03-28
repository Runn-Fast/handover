import { Action } from '../types.js'

type CreateActionUserMapperOptions = {
  regExp: RegExp
  mapAction: (action: Action, match: string[]) => Promise<Action>
}

const createActionUserMapper = (options: CreateActionUserMapperOptions) => {
  const { regExp, mapAction } = options

  return async (action: Action): Promise<Action[]> => {
    const { type, text, previousText } = action

    if (text == null) {
      return [action]
    }

    const match = text.match(regExp)
    const nextAction = match != null ? await mapAction(action, match) : action

    const actions = [nextAction]

    if (type === 'CHANGE' && previousText != null) {
      const previousMatch = previousText.match(regExp)
      const previousAction =
        previousMatch != null ? await mapAction(action, previousMatch) : action

      if (previousAction.user !== nextAction.user) {
        actions.push({
          ...previousAction,
          type: 'REMOVE',
        })
      }
    }

    return actions
  }
}

export default createActionUserMapper

import capitalize from 'lodash/capitalize.js'
import { dayNamesMap } from '../../date-utils.js'

export const isValidDay = (days: string[]) => {
  const capitalizedDays = Object.keys(dayNamesMap).map((day) => capitalize(day))

  const dayNamesValidated = days.every(
    (day: string) => day.toLowerCase() in dayNamesMap,
  )

  if (!dayNamesValidated) {
    return `Please use one of [ ${capitalizedDays.join(` | `)} ]`
  }

  return true
}

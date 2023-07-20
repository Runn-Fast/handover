import capitalize from 'lodash/capitalize.js'
import { dayNamesMap } from '../../date-utils.js'

const isValidDay = (days: string[]) => {
  const capitalizedDays = Object.keys(dayNamesMap).map((day) => capitalize(day))

  const isValidDay = days.every(
    (day: string) => day.toLowerCase() in dayNamesMap,
  )

  if (!isValidDay) {
    return `Please use one of [ ${capitalizedDays.join(` | `)} ]`
  }

  return true
}

export default { isValidDay }

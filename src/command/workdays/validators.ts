import { z } from 'zod'
import { parseDayOfWeek } from '../../date-utils.js'

// Note: this is a case insensitive regex
const dayNameRegex =
  /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i

const $DayOfWeek = z
  .string()
  .regex(
    dayNameRegex,
    'Please use one of [ Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday ]',
  )
  .transform((dayName) => {
    return parseDayOfWeek(dayName)
  })

export { $DayOfWeek }

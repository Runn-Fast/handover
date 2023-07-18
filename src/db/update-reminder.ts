import type { Prisma } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const updateReminder = async (
  reminderId: number,
  data: Prisma.ReminderUpdateInput,
) =>
  errorBoundary(() =>
    prisma.reminder.update({
      where: { id: reminderId },
      data,
    }),
  )

export { updateReminder }

import { prisma } from './prisma.js'

type UpdateUserOptions = {
  userId: string
  dailyReminderTime: string
}

const updateUser = async (
  options: UpdateUserOptions,
): Promise<void | Error> => {
  const { userId, dailyReminderTime } = options

  const isValidTime = /^\d\d:\d\d$/.test(dailyReminderTime)
  if (!isValidTime) {
    return new Error('Invalid time, must be in the format HH:MM')
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      dailyReminderTime,
    },
  })
}

export { updateUser }

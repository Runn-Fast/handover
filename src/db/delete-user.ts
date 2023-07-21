import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

type DeleteUserOptions = {
  userId: string
}

const deleteUser = async (
  options: DeleteUserOptions,
): Promise<void | Error> => {
  const { userId } = options
  return errorBoundary(async () => {
    const deletePostItems = prisma.postItem.deleteMany({
      where: { post: { userId } },
    })
    const deletePosts = prisma.post.deleteMany({ where: { userId } })
    const deleteReminder = prisma.reminder.deleteMany({
      where: { userId },
    })
    const deleteUser = prisma.user.delete({ where: { id: userId } })
    await prisma.$transaction([
      deletePostItems,
      deletePosts,
      deleteReminder,
      deleteUser,
    ])
  })
}

export { deleteUser }

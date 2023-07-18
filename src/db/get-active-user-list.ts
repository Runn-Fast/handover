import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'
import type { UserWithPosts } from './types.js'

// Find users that have posted something in the last 7 days
type GetActiveUserListOptions = {
  activeSince: Date
}

const getActiveUserList = async (
  options: GetActiveUserListOptions,
): Promise<UserWithPosts[] | Error> => {
  const { activeSince } = options
  return errorBoundary(async () =>
    prisma.user.findMany({
      where: {
        posts: {
          some: {
            date: {
              gte: activeSince,
            },
            items: {
              some: {},
            },
          },
        },
      },
      include: {
        posts: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    }),
  )
}

export { getActiveUserList }

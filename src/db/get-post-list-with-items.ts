import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'
import type { PostWithItems } from './types.js'

type GetPostListWithItems = {
  userId: string
  startDate: Date
  endDate: Date
}

const getPostListWithItems = async (
  options: GetPostListWithItems,
): Promise<PostWithItems[] | Error> => {
  const { userId, startDate, endDate } = options

  return errorBoundary(async () =>
    prisma.post.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          orderBy: {
            ts: 'asc',
          },
        },
      },
    }),
  )
}

export { getPostListWithItems }

import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'
import type { PostWithItems } from './types.js'

type GetPostWithItemsOptions = {
  userId: string
  date: Date
}

const getPostWithItems = async (
  options: GetPostWithItemsOptions,
): Promise<PostWithItems | Error> => {
  const { userId, date } = options
  return errorBoundary(() =>
    prisma.post.findUniqueOrThrow({
      where: { userDate: { userId, date } },
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

export { getPostWithItems }

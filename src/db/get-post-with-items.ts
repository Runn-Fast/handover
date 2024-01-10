import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'
import type { PostWithItems } from './types.js'

type GetPostWithItemsOptions = {
  userId: string
  date: Date
}

const getPostWithItems = async (
  options: GetPostWithItemsOptions,
): Promise<PostWithItems | Error | undefined> => {
  const { userId, date } = options
  const row = await errorBoundary(async () =>
    prisma.post.findUnique({
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
  return row ?? undefined
}

export { getPostWithItems }

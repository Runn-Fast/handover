import type { Post } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

type GetPostOptions = {
  id: number
}

const getPost = async (options: GetPostOptions): Promise<Post | Error> => {
  const { id } = options
  return errorBoundary(async () =>
    prisma.post.findUniqueOrThrow({
      where: { id },
    }),
  )
}

export { getPost }

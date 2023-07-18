import type { PostItem } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

type DeletePostItemOptions = {
  channel: string
  ts: string
}

const deletePostItem = async (
  options: DeletePostItemOptions,
): Promise<PostItem | Error> => {
  const { channel, ts } = options
  return errorBoundary(() =>
    prisma.postItem.delete({
      where: { channelTs: { channel, ts } },
    }),
  )
}

export { deletePostItem }

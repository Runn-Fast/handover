import type { Format } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const getFormatList = async (): Promise<Format[] | Error> => {
  return errorBoundary(async () =>
    prisma.format.findMany({
      include: {
        user: true,
      },
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
  )
}

export { getFormatList }

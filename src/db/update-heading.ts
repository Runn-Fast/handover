import type { Prisma } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const updateHeading = async (
  headingId: number,
  data: Prisma.HeadingUpdateInput,
) =>
  errorBoundary(() =>
    prisma.heading.update({
      where: { id: headingId },
      data,
    }),
  )

export { updateHeading }

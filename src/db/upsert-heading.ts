import type { Prisma } from '@prisma/client'
import { errorBoundary } from '@stayradiated/error-boundary'
import { prisma } from './prisma.js'

const upsertHeading = async (heading: Prisma.HeadingUncheckedCreateInput) =>
  errorBoundary(() =>
    prisma.heading.upsert({
      create: heading,
      update: heading,
      where: { date: heading.date },
    }),
  )

export { upsertHeading }

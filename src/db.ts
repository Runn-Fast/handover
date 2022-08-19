import pkg, { Prisma, Post, PostItem } from '@prisma/client'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

const getUserList = () => {
  return prisma.user.findMany()
}

// Find users that have posted something in the last 7 days
type GetActiveUserListOptions = {
  activeSince: Date
}
const getActiveUserList = (options: GetActiveUserListOptions) => {
  const { activeSince } = options
  return prisma.user.findMany({
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
  })
}

const upsertUser = (user: Prisma.UserUncheckedCreateInput) => {
  return prisma.user.upsert({
    create: user,
    update: user,
    where: { id: user.id },
  })
}

const upsertHeading = (heading: Prisma.HeadingUncheckedCreateInput) => {
  return prisma.heading.upsert({
    create: heading,
    update: heading,
    where: { date: heading.date },
  })
}

const updateHeading = (headingId: number, data: Prisma.HeadingUpdateInput) => {
  return prisma.heading.update({
    where: { id: headingId },
    data,
  })
}

const upsertPost = (post: Prisma.PostUncheckedCreateInput) => {
  return prisma.post.upsert({
    create: post,
    update: post,
    where: { userDate: { userId: post.userId, date: post.date } },
  })
}

const updatePost = (postId: number, data: Prisma.PostUpdateInput) => {
  return prisma.post.update({
    where: { id: postId },
    data,
  })
}

const upsertPostItem = (postItem: Prisma.PostItemUncheckedCreateInput) => {
  return prisma.postItem.upsert({
    create: postItem,
    update: postItem,
    where: { channelTs: { channel: postItem.channel, ts: postItem.ts } },
  })
}

const getReminder = (reminder: { userId: string; date: string }) => {
  return prisma.reminder.findUnique({
    where: { userDate: { userId: reminder.userId, date: reminder.date } },
  })
}

const upsertReminder = (reminder: Prisma.ReminderUncheckedCreateInput) => {
  return prisma.reminder.upsert({
    create: reminder,
    update: reminder,
    where: { userDate: { userId: reminder.userId, date: reminder.date } },
  })
}

const updateReminder = (
  reminderId: number,
  data: Prisma.ReminderUpdateInput,
) => {
  return prisma.reminder.update({
    where: { id: reminderId },
    data,
  })
}

type AddPostOptions = {
  userId: string
  title: string
  date: string
}
const addPost = async (options: AddPostOptions): Promise<Post> => {
  const post = await upsertPost(options)
  return post
}

type AddPostItemOptions = {
  postId: number
  channel: string
  ts: string
  text: string
}
const addPostItem = async (options: AddPostItemOptions): Promise<PostItem> => {
  const postItem = await upsertPostItem(options)
  return postItem
}

type DeletePostItemOptions = {
  channel: string
  ts: string
}

const deletePostItem = (options: DeletePostItemOptions) => {
  const { channel, ts } = options
  return prisma.postItem.delete({
    where: { channelTs: { channel, ts } },
  })
}

type GetPostWithItemsOptions = {
  userId: string
  date: string
}

const getPostWithItems = (options: GetPostWithItemsOptions) => {
  const { userId, date } = options
  return prisma.post.findUnique({
    where: { userDate: { userId, date } },
    include: {
      items: {
        orderBy: {
          ts: 'asc',
        },
      },
    },
  })
}

type PostWithItems = NonNullable<Awaited<ReturnType<typeof getPostWithItems>>>

export {
  getUserList,
  getActiveUserList,
  upsertUser,
  upsertHeading,
  updateHeading,
  upsertPost,
  updatePost,
  upsertReminder,
  updateReminder,
  getReminder,
  addPost,
  addPostItem,
  deletePostItem,
  getPostWithItems,
}

export type { PostWithItems }

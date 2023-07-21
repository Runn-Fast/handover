import type { Post } from '@prisma/client'

const getLatestPost = <P extends Pick<Post, 'date'>>(
  posts: readonly P[],
): P | undefined => {
  if (posts.length === 0) {
    return undefined
  }

  // Sort posts by date descending
  const sortedPosts = [...posts].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  )
  return sortedPosts[0]
}

export { getLatestPost }

import { prisma } from '@/lib/prisma.js'

// ============================================
// USER REPOSITORY
// ============================================

export const userRepository = {
  async create(username, email, password, bio = '', profilePicture = '') {
    return prisma.user.create({
      data: {
        username,
        email,
        password,
        bio,
        profilePicture,
      },
    })
  },

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        posts: true,
        followers: true,
        following: true,
        likes: true,
        comments: true,
      },
    })
  },

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  async findByUsername(username) {
    return prisma.user.findUnique({
      where: { username },
    })
  },

  async update(id, { username, bio, profilePicture }) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(profilePicture && { profilePicture }),
      },
    })
  },

  async findAll() {
    return prisma.user.findMany({
      include: {
        _count: {
          select: { followers: true, following: true, posts: true },
        },
      },
    })
  },
}

// ============================================
// FOLLOW REPOSITORY
// ============================================

export const followRepository = {
  async create(followerId, followingId) {
    return prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    })
  },

  async delete(followerId, followingId) {
    return prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    })
  },

  async isFollowing(followerId, followingId) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    })
    return !!follow
  },

  async getFollowers(userId) {
    return prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
    })
  },

  async getFollowing(userId) {
    return prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: true },
    })
  },
}

// ============================================
// POST REPOSITORY
// ============================================

export const postRepository = {
  async create(authorId, content) {
    return prisma.post.create({
      data: {
        content,
        authorId,
      },
      include: {
        author: true,
        comments: true,
        likes: true,
      },
    })
  },

  async findById(id) {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        comments: {
          include: { author: true },
        },
        likes: true,
      },
    })
  },

  async findByAuthorId(authorId) {
    return prisma.post.findMany({
      where: { authorId },
      include: {
        author: true,
        comments: true,
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getFeedForUser(userId) {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })
    const followingIds = following.map(f => f.followingId)

    return prisma.post.findMany({
      where: {
        authorId: { in: followingIds },
      },
      include: {
        author: true,
        comments: {
          include: { author: true },
        },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async delete(id, authorId) {
    const post = await prisma.post.findUnique({ where: { id } })
    if (post?.authorId !== authorId) {
      throw new Error('Only the author can delete this post')
    }
    return prisma.post.delete({ where: { id } })
  },
}

// ============================================
// LIKE REPOSITORY
// ============================================

export const likeRepository = {
  async toggle(userId, postId) {
    const existing = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    })

    if (existing) {
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      })
      return { liked: false }
    } else {
      await prisma.like.create({
        data: { userId, postId },
      })
      return { liked: true }
    }
  },

  async hasLiked(userId, postId) {
    const like = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    })
    return !!like
  },

  async countByPost(postId) {
    return prisma.like.count({
      where: { postId },
    })
  },
}

// ============================================
// COMMENT REPOSITORY
// ============================================

export const commentRepository = {
  async create(postId, authorId, content) {
    return prisma.comment.create({
      data: {
        content,
        authorId,
        postId,
      },
      include: {
        author: true,
      },
    })
  },

  async delete(id, authorId) {
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (comment?.authorId !== authorId) {
      throw new Error('Only the author can delete this comment')
    }
    return prisma.comment.delete({ where: { id } })
  },

  async findByPostId(postId) {
    return prisma.comment.findMany({
      where: { postId },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    })
  },
}

// ---------------------------------------------------------------
// STATISTICS REPOSITORY
// ---------------------------------------------------------------

const STOP_WORDS = new Set([
  'the','and','for','with','that','this','from','what','when','your','have','just','been','there',
  'they','their','them','then','than','about','would','could','should','which','while','where','other',
  'these','those','because','before','after','again','only','over','under','between','among','through',
  'during','without','within','while','because','again','here','our','ours','has','had','will','can','dont',
  'does','did','its','its','are','was','were','who','why','how','all','any','one','two','new','use','uses',
  'used','out','now','may','make','made','need','still','even','more','most','some','such','very','as','in',
  'on','at','by','an','be','it','is','of','to','a','i','me','my','we','us','it','oh','so','if','no',
])

function normalizeWords(text) {
  return (text || '')
    .toLowerCase()
    .match(/\b[a-z']+\b/g)
    ?.filter((word) => word.length > 1 && !STOP_WORDS.has(word)) ?? []
}

function topWords(texts, limit = 10) {
  const counts = new Map()
  for (const text of texts) {
    for (const token of normalizeWords(text)) {
      counts.set(token, (counts.get(token) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }))
}

export const statisticsRepository = {
  async overview() {
    const [totalUsers, totalPosts, totalLikes, totalComments, totalFollows] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.like.count(),
        prisma.comment.count(),
        prisma.follow.count(),
      ])

    return { totalUsers, totalPosts, totalLikes, totalComments, totalFollows }
  },

  async getAverageFollowersPerUser() {
    const [totalUsers, totalFollows] = await Promise.all([
      prisma.user.count(),
      prisma.follow.count(),
    ])
    return totalUsers > 0 ? totalFollows / totalUsers : 0
  },

  async getAveragePostsPerUser() {
    const [totalUsers, totalPosts] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
    ])
    return totalUsers > 0 ? totalPosts / totalUsers : 0
  },

  async getAverageLikesPerPost() {
    const [totalPosts, totalLikes] = await Promise.all([
      prisma.post.count(),
      prisma.like.count(),
    ])
    return totalPosts > 0 ? totalLikes / totalPosts : 0
  },

  async getTopUsersByFollowers(limit = 5) {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { followers: true },
        },
      },
      orderBy: {
        followers: {
          _count: 'desc',
        },
      },
      take: limit,
    })

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      followers: user._count.followers,
    }))
  },

  async getMostActiveUsers(limit = 5) {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { posts: true, comments: true, likes: true },
        },
      },
    })

    return users
      .map((user) => ({
        id: user.id,
        username: user.username,
        posts: user._count.posts,
        comments: user._count.comments,
        likes: user._count.likes,
        activity: user._count.posts + user._count.comments + user._count.likes,
      }))
      .sort((a, b) => b.activity - a.activity || b.posts - a.posts)
      .slice(0, limit)
  },

  async getTopPostsByLikes(limit = 5) {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
      take: limit,
    })

    return posts.map((post) => ({
      id: post.id,
      content: post.content,
      author: post.author.username,
      likes: post._count.likes,
      comments: post._count.comments,
    }))
  },

  async getTopPostsByComments(limit = 5) {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: {
        comments: {
          _count: 'desc',
        },
      },
      take: limit,
    })

    return posts.map((post) => ({
      id: post.id,
      content: post.content,
      author: post.author.username,
      comments: post._count.comments,
      likes: post._count.likes,
    }))
  },

  async getTopWordsForPosts(limit = 10) {
    const posts = await prisma.post.findMany({ select: { content: true } })
    return topWords(posts.map((post) => post.content), limit)
  },

  async getTopWordsForComments(limit = 10) {
    const comments = await prisma.comment.findMany({ select: { content: true } })
    return topWords(comments.map((comment) => comment.content), limit)
  },
}

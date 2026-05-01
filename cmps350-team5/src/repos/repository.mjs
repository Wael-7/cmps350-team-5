import { prisma } from './prisma.mjs'

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
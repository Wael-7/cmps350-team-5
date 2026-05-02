import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.js'

export async function GET() {
  try {
    // ── Overview counts ───────────────────────────────────────
    const [totalUsers, totalPosts, totalLikes, totalComments, totalFollows] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.like.count(),
        prisma.comment.count(),
        prisma.follow.count(),
      ])

    const avgFollowersPerUser = totalUsers > 0 ? (totalFollows / totalUsers).toFixed(2) : 0
    const avgPostsPerUser     = totalUsers > 0 ? (totalPosts   / totalUsers).toFixed(2) : 0
    const avgLikesPerPost     = totalPosts > 0 ? (totalLikes   / totalPosts).toFixed(2) : 0

    // ── Most followed users (top 5) ───────────────────────────
    const mostFollowedRaw = await prisma.user.findMany({
      select: {
        id: true, username: true, email: true, profilePicture: true,
        _count: { select: { followers: true } },
      },
      orderBy: { followers: { _count: 'desc' } },
      take: 5,
    })
    const mostFollowed = mostFollowedRaw.map(u => ({
      id: u.id, username: u.username, email: u.email,
      profilePicture: u.profilePicture,
      followerCount: u._count.followers,
    }))

    // ── Top posters (top 5) ───────────────────────────────────
    const topPostersRaw = await prisma.user.findMany({
      select: {
        id: true, username: true, email: true, profilePicture: true,
        _count: { select: { posts: true } },
      },
      orderBy: { posts: { _count: 'desc' } },
      take: 5,
    })
    const topPosters = topPostersRaw.map(u => ({
      id: u.id, username: u.username, email: u.email,
      profilePicture: u.profilePicture,
      postCount: u._count.posts,
    }))

    // ── Most active users — posts + comments (top 5) ──────────
    const allUsers = await prisma.user.findMany({
      select: {
        id: true, username: true, email: true, profilePicture: true,
        _count: { select: { posts: true, comments: true } },
      },
    })
    const mostActive = allUsers
      .map(u => ({
        id: u.id, username: u.username, email: u.email,
        profilePicture: u.profilePicture,
        activityScore: u._count.posts + u._count.comments,
      }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 5)

    // ── Most liked posts (top 5) ──────────────────────────────
    const topLikedRaw = await prisma.post.findMany({
      select: {
        id: true, content: true, createdAt: true,
        author: { select: { username: true, profilePicture: true } },
        _count: { select: { likes: true } },
      },
      orderBy: { likes: { _count: 'desc' } },
      take: 5,
    })
    const topLikedPosts = topLikedRaw.map(p => ({
      id: p.id, content: p.content, createdAt: p.createdAt,
      author: p.author,
      likeCount: p._count.likes,
    }))

    // ── Posts per day — last 7 days ───────────────────────────
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentPosts = await prisma.post.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    })

    // Build day buckets for the last 7 days
    const dayMap = {}
    for (let d = 0; d < 7; d++) {
      const day = new Date()
      day.setDate(day.getDate() - (6 - d))
      const key = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dayMap[key] = 0
    }
    for (const post of recentPosts) {
      const key = new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
      })
      if (key in dayMap) dayMap[key]++
    }
    const postsPerDay = Object.entries(dayMap).map(([label, value]) => ({ label, value }))

    return NextResponse.json({
      overview: {
        totalUsers, totalPosts, totalLikes, totalComments, totalFollows,
        avgFollowersPerUser, avgPostsPerUser, avgLikesPerPost,
      },
      mostFollowed,
      topPosters,
      mostActive,
      topLikedPosts,
      postsPerDay,
    })
  } catch (error) {
    console.error('[/api/statistics]', error)
    return NextResponse.json({ error: 'Failed to load statistics' }, { status: 500 })
  }
}

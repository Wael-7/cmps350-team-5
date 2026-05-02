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
      id: u.id,
      username: u.username,
      email: u.email,
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
      id: u.id,
      username: u.username,
      email: u.email,
      profilePicture: u.profilePicture,
      postCount: u._count.posts,
    }))

    // ── Most active users — posts + comments combined (top 5) ─
    const allUsers = await prisma.user.findMany({
      select: {
        id: true, username: true, email: true, profilePicture: true,
        _count: { select: { posts: true, comments: true } },
      },
    })
    const mostActive = allUsers
      .map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        profilePicture: u.profilePicture,
        activityScore: u._count.posts + u._count.comments,
      }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 5)

    return NextResponse.json({
      overview: {
        totalUsers, totalPosts, totalLikes, totalComments, totalFollows,
        avgFollowersPerUser, avgPostsPerUser, avgLikesPerPost,
      },
      mostFollowed,
      topPosters,
      mostActive,
    })
  } catch (error) {
    console.error('[/api/statistics]', error)
    return NextResponse.json({ error: 'Failed to load statistics' }, { status: 500 })
  }
}

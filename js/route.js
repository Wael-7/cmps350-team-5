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

    const avgFollowersPerUser = totalUsers > 0
      ? (totalFollows / totalUsers).toFixed(2) : 0
    const avgPostsPerUser = totalUsers > 0
      ? (totalPosts / totalUsers).toFixed(2) : 0
    const avgLikesPerPost = totalPosts > 0
      ? (totalLikes / totalPosts).toFixed(2) : 0

    return NextResponse.json({
      overview: {
        totalUsers,
        totalPosts,
        totalLikes,
        totalComments,
        totalFollows,
        avgFollowersPerUser,
        avgPostsPerUser,
        avgLikesPerPost,
      },
    })
  } catch (error) {
    console.error('[/api/statistics]', error)
    return NextResponse.json(
      { error: 'Failed to load statistics' },
      { status: 500 }
    )
  }
}

import { statisticsRepository } from '@/repos/repository.mjs'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [overview, avgFollowersPerUser, avgPostsPerUser, avgLikesPerPost, topUsersByFollowers, mostActiveUsers, topLikedPosts, topCommentedPosts, topPostWords, topCommentWords] =
      await Promise.all([
        statisticsRepository.overview(),
        statisticsRepository.getAverageFollowersPerUser(),
        statisticsRepository.getAveragePostsPerUser(),
        statisticsRepository.getAverageLikesPerPost(),
        statisticsRepository.getTopUsersByFollowers(5),
        statisticsRepository.getMostActiveUsers(5),
        statisticsRepository.getTopPostsByLikes(5),
        statisticsRepository.getTopPostsByComments(5),
        statisticsRepository.getTopWordsForPosts(10),
        statisticsRepository.getTopWordsForComments(10),
      ])

    return NextResponse.json({
      overview,
      averages: {
        avgFollowersPerUser,
        avgPostsPerUser,
        avgLikesPerPost,
      },
      topUsersByFollowers,
      mostActiveUsers,
      topLikedPosts,
      topCommentedPosts,
      topPostWords,
      topCommentWords,
    })
  } catch (error) {
    console.error('[/api/statistics]', error)
    return NextResponse.json(
      { error: 'Failed to load statistics' },
      { status: 500 }
    )
  }
}

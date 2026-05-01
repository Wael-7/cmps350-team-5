import { followRepository } from '@/lib/repository.mjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
    try {
        const { followerId, followingId, action } = await req.json()

        if (action === 'follow') {
            await followRepository.create(followerId, followingId)
            return NextResponse.json({ success: true })
        } else if (action === 'unfollow') {
            await followRepository.delete(followerId, followingId)
            return NextResponse.json({ success: true })
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

export async function GET(req) {
    try {
        const searchParams = req.nextUrl.searchParams
        const followerId = searchParams.get('followerId')
        const followingId = searchParams.get('followingId')

        if (followerId && followingId) {
            const isFollowing = await followRepository.isFollowing(
                followerId,
                followingId
            )
            return NextResponse.json({ isFollowing })
        }

        return NextResponse.json(
            { error: 'Missing parameters' },
            { status: 400 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
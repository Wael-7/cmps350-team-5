import { likeRepository } from '@/lib/repository.mjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
    try {
        const { userId, postId } = await req.json()
        const result = await likeRepository.toggle(userId, postId)
        return NextResponse.json(result)
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
        const userId = searchParams.get('userId')
        const postId = searchParams.get('postId')

        if (!userId || !postId) {
            return NextResponse.json(
                { error: 'userId and postId required' },
                { status: 400 }
            )
        }

        const hasLiked = await likeRepository.hasLiked(userId, postId)
        return NextResponse.json({ hasLiked })
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
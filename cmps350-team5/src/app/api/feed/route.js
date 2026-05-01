import { postRepository } from '@/lib/repository.mjs'
import { NextResponse } from 'next/server'

export async function GET(req) {
    try {
        const searchParams = req.nextUrl.searchParams
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'userId required' },
                { status: 400 }
            )
        }

        const feed = await postRepository.getFeedForUser(userId)
        return NextResponse.json(feed)
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
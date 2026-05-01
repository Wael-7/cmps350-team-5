import { followRepository } from '@/lib/repository.mjs'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
    try {
        const following = await followRepository.getFollowing(params.id)
        return NextResponse.json(following)
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
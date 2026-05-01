import { followRepository } from '@/repos/repository.mjs'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
    try {
        const followers = await followRepository.getFollowers(params.id)
        return NextResponse.json(followers)
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
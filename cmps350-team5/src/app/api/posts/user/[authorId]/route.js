import { postRepository } from '@/repos/repository.mjs'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
    try {
        const posts = await postRepository.findByAuthorId(params.authorId)
        return NextResponse.json(posts)
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
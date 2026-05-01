import { commentRepository } from '@/repos/repository.mjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
    try {
        const { postId, authorId, content } = await req.json()
        const comment = await commentRepository.create(postId, authorId, content)
        return NextResponse.json(comment, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
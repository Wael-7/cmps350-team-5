import { postRepository } from '@/repos/repository.mjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
    try {
        const { authorId, content } = await req.json()

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: 'Post content cannot be empty' },
                { status: 400 }
            )
        }

        const post = await postRepository.create(authorId, content)
        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
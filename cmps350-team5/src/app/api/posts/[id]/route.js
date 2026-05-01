import { postRepository } from '@/lib/repository.mjs'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
    try {
        const post = await postRepository.findById(params.id)
        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(post)
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

export async function DELETE(req, { params }) {
    try {
        const { authorId } = await req.json()
        await postRepository.delete(params.id, authorId)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 403 }
        )
    }
}
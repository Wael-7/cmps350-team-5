import { postRepository } from '@/repos/repository.mjs'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
    try {
        const { id } = await params
        const post = await postRepository.findById(id)
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
        const { id } = await params
        const { authorId } = await req.json()
        await postRepository.delete(id, authorId)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 403 }
        )
    }
}
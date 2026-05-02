import { commentRepository } from '@/repos/repository.mjs'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
    try {
        const { id } = await params
        const comments = await commentRepository.findByPostId(id)
        return NextResponse.json(comments)
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

import { commentRepository } from '@/repos/repository.mjs'
import { NextResponse } from 'next/server'

export async function DELETE(req, { params }) {
    try {
        const { id } = await params
        const { authorId } = await req.json()
        await commentRepository.delete(id, authorId)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 403 }
        )
    }
}
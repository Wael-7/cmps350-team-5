import { userRepository } from '@/lib/repository.mjs'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
    try {
        const user = await userRepository.findById(params.id)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

export async function PUT(req, { params }) {
    try {
        const updates = await req.json()
        const user = await userRepository.update(params.id, updates)
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
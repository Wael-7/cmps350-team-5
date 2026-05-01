import { userRepository } from '@/lib/repository.mjs'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const users = await userRepository.findAll()
        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
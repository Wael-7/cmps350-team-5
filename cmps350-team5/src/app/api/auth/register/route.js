import { userRepository } from '@/lib/repository.mjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
    try {
        const { username, email, password } = await req.json()

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const existing = await userRepository.findByEmail(email)
        if (existing) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            )
        }

        const user = await userRepository.create(username, email, password)

        return NextResponse.json(
            { success: true, user },
            { status: 201 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
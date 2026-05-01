import { userRepository } from '@/lib/repository.mjs'
import { NextResponse } from 'next/server'

export async function POST(req) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password required' },
                { status: 400 }
            )
        }

        const user = await userRepository.findByEmail(email)
        if (!user || user.password !== password) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        return NextResponse.json({ success: true, user })
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
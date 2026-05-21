// src/middleware.js
import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth(function middleware(req) {
    const { pathname } = req.nextUrl
    const session = req.auth

    // Protect wholesale profile routes
    if (pathname.startsWith('/wholesale/profile')) {
        if (!session || !session.user) {
            return NextResponse.redirect(new URL('/wholesale', req.url))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/wholesale/profile/:path*'],
}
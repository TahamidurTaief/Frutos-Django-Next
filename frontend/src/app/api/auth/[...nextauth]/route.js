// src/app/api/auth/[...nextauth]/route.js
import { handlers } from '@/auth'

// handlers is an object { GET, POST } — must destructure, not alias
export const { GET, POST } = handlers
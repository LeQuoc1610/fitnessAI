/**
 * Base URL của backend API.
 * Đặt NEXT_PUBLIC_API_URL=http://localhost:4000/api trong .env.local
 * Khi deploy production, đổi thành URL của backend server thực tế.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

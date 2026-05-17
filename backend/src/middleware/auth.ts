import { Request, Response, NextFunction } from 'express'
import { getSupabaseAdmin } from '../lib/supabase-admin'

// Mở rộng Request để gắn user vào
declare global {
  namespace Express {
    interface Request {
      userId: string
      userEmail?: string
    }
  }
}

/**
 * Middleware xác thực Bearer token từ Supabase.
 * Gắn req.userId để các route dùng tiếp.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  if (!token) {
    res.status(401).json({ error: 'Thiếu token xác thực' })
    return
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' })
      return
    }

    req.userId = data.user.id
    req.userEmail = data.user.email
    next()
  } catch (err) {
    console.error('[requireAuth] error:', err)
    res.status(500).json({ error: 'Lỗi xác thực' })
  }
}

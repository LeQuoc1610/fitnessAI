'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

/**
 * Hook để lấy thông tin user hiện tại
 * @returns { user, loading } - Trả về user object từ Supabase Auth
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Lấy user hiện tại khi component mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Lắng nghe thay đổi auth state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Cleanup subscription khi component unmount
    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

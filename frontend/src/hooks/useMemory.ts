import { useState, useEffect, useCallback } from 'react'
import type { UserMemory } from '@/types'
import { createClient } from '@/utils/supabase/client'
import { API_BASE } from '@/utils/api'

/**
 * Hook để quản lý user memory (lịch sử, mục tiêu, tiến độ) cho từng agent
 * @param userId - ID của user (null nếu chưa đăng nhập)
 * @param agentId - ID của agent (fitness hoặc nutrition)
 * @returns { memory, isLoading, updateMemory, resetMemory, refetch }
 */
export function useMemory(userId: string | null, agentId = 'fitness') {
  const [memory, setMemory] = useState<UserMemory | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user memory từ API endpoint với auth token
  const fetchMemory = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // Gọi API memory endpoint với agent ID
      const res = await fetch(`${API_BASE}/memory?agentId=${agentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const data = await res.json()
      setMemory(data.memory)
    } catch {
      console.error('Failed to fetch memory')
    } finally {
      setIsLoading(false)
    }
  }, [userId, agentId])

  useEffect(() => {
    fetchMemory()
  }, [fetchMemory])

  /**
   * Update memory với optimistic update - cập nhật local state trước khi gửi lên server
   * Nếu API fail, sẽ refetch để lấy dữ liệu chính xác từ server
   */
  const updateMemory = useCallback(
    async (updates: Partial<UserMemory>) => {
      if (!userId) return
      // Optimistic update: cập nhật UI ngay lập tức
      setMemory((prev) => prev ? { ...prev, ...updates } : null)
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        await fetch(`${API_BASE}/memory`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ agentId, updates }),
        })
      } catch {
        console.error('Failed to update memory')
        // Nếu update fail, refetch dữ liệu từ server để đảm bảo sync
        fetchMemory()
      }
    },
    [userId, agentId, fetchMemory]
  )

  /**
   * Reset/xóa tất cả memory của user cho agent này
   * Sau khi xóa, refetch để cập nhật UI
   */
  const resetMemory = useCallback(async () => {
    if (!userId) return
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      await fetch(`${API_BASE}/memory`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ agentId }),
      })
      await fetchMemory()
    } catch {
      console.error('Failed to reset memory')
    }
  }, [userId, agentId, fetchMemory])

  return { memory, isLoading, updateMemory, resetMemory, refetch: fetchMemory }
}

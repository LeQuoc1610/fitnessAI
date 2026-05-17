import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { API_BASE } from '@/utils/api'

/**
 * Hook để quản lý check-in (tập luyện hôm nay)
 * - Fetch trạng thái check-in, số lần, streak days
 * - Cho phép user check-in (báo cáo tập hôm nay)
 * - Server sẽ tính streak và cập nhật memory
 * @returns { checkedToday, checkInCount, streakDays, loading, checkIn, refetch }
 */
export function useCheckin(userId: string | null, agentId = 'fitness') {
  const [checkedToday, setCheckedToday] = useState<boolean | null>(null)
  const [checkInCount, setCheckInCount] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchStatus = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch(`${API_BASE}/checkin?agentId=${agentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const data = await res.json()

      if (res.ok) {
        setCheckedToday(data.checkedToday)
        setCheckInCount(data.checkInCount)
        setStreakDays(data.streakDays)
      }
    } catch (err) {
      console.error('fetchStatus error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, agentId])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const checkIn = useCallback(async (opts?: { didWorkout?: boolean; note?: string }) => {
    if (!userId) return null
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch(`${API_BASE}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ agentId, didWorkout: opts?.didWorkout ?? true, note: opts?.note ?? null }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Check-in failed')
      }

      setCheckedToday(true)
      setCheckInCount(data.checkInCount)
      setStreakDays(data.streakDays)
      return data
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err) || 'Check-in failed'
      console.error('checkIn error:', msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [userId, agentId])

  return { checkedToday, checkInCount, streakDays, loading, checkIn, refetch: fetchStatus }
}

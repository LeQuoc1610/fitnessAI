import { useState, useCallback, useEffect } from 'react'
import type { Message, UserMemory } from '@/types'
import { createClient } from '@/utils/supabase/client'
import { API_BASE } from '@/utils/api'

interface UseNutritionChatOptions {
  userId: string
  onMemoryUpdate?: (memory: Partial<UserMemory>) => void
  agentId?: string
  checkedToday?: boolean
}

/**
 * Hook để quản lý chat với Nutrition agent
 * - Fetch lịch sử chat của user
 * - Hiển thị intro message nếu lần đầu
 * - Thêm check-in prompt nếu chưa log bữa ăn hôm nay
 * - Xử lý gửi message và cập nhật memory
 */
export function useNutritionChat({ userId, onMemoryUpdate, agentId = 'nutrition', checkedToday = true }: UseNutritionChatOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let mounted = true
    setIsLoading(true)
    setError(null)

    ;(async () => {
      try {
        const supabase = createClient()
        let { data: { session } } = await supabase.auth.getSession()
        
        // Refresh token nếu hết hạn
        if (!session) {
          const { data, error } = await supabase.auth.refreshSession()
          if (error || !data.session) {
            console.warn('No session available, user may need to login')
            setError('Vui lòng đăng nhập trước.')
            setIsLoading(false)
            return
          }
          session = data.session
        }
        
        const token = session.access_token

        const res = await fetch(`${API_BASE}/chat?agentId=${agentId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) {
          const errMsg = await res.text().catch(() => 'Unknown error')
          throw new Error(`Failed to fetch conversation history (${res.status}): ${errMsg}`)
        }
        const data = await res.json()
        const fetched: Message[] = data.messages ?? []

        const intro: Message = {
          role: 'assistant',
          content: `Tôi là **NUTRITION** — chuyên gia dinh dưỡng của ứng dụng Healthy.\n\nKhông phải app khoá chế độ ăn khắt khe. Không phải bảng tính phức tạp.\n\nTôi ở đây để giúp mày ăn đúng cách — phù hợp mục tiêu, dễ thực hiện, với thực phẩm Việt Nam.\n\nTrước khi bắt đầu, tôi cần biết 3 thứ:\n\n**1.** Mục tiêu: giảm mỡ / tăng cơ / sức khỏe / tổng thể?\n**2.** Vấn đề hiện tại: ăn bừa bãi / không đủ protein / hay snack / chưa biết ăn gì?\n**3.** Dị ứng hoặc tránh: sữa / tôm cua / đồ cay / chay / gì khác?\n\nTrả lời đi.`,
          timestamp: new Date().toISOString(),
        }

        const checkPrompt: Message = {
          role: 'assistant',
          content: 'Chưa log bữa ăn hôm nay. Nếu bạn muốn, hãy kể về chế độ ăn của mình hôm qua?',
          timestamp: new Date().toISOString(),
        }

        if (fetched.length === 0) {
          if (checkedToday === false) {
            setMessages([checkPrompt, intro])
          } else {
            setMessages([intro])
          }
        } else {
          if (checkedToday === false) {
            setMessages([checkPrompt, ...fetched])
          } else {
            setMessages(fetched)
          }
        }
      } catch (err) {
        console.error('Failed to load chat history', err)
        setError('Không thể tải lịch sử chat.')
        setMessages([
          {
            role: 'assistant',
            content: `Tôi là **NUTRITION** — chuyên gia dinh dưỡng của ứng dụng Healthy.\n\nKhông phải app khoá chế độ ăn khắt khe. Không phải bảng tính phức tạp.\n\nTôi ở đây để giúp mày ăn đúng cách — phù hợp mục tiêu, dễ thực hiện, với thực phẩm Việt Nam.`,
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [userId, agentId, checkedToday])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: Message = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        let { data: { session } } = await supabase.auth.getSession()
        
        // Refresh token nếu hết hạn
        if (!session) {
          const { data, error } = await supabase.auth.refreshSession()
          if (error || !data.session) {
            throw new Error('Phiên làm việc hết hạn, vui lòng đăng nhập lại.')
          }
          session = data.session
        }
        
        const token = session.access_token

        const res = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ message: content.trim(), agentId }),
        })

        if (!res.ok) {
          const errMsg = await res.text().catch(() => 'Unknown error')
          throw new Error(`Server error (${res.status}): ${errMsg}`)
        }

        const data = await res.json()

        const aiMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, aiMessage])

        if (data.updatedMemory && onMemoryUpdate) {
          onMemoryUpdate(data.updatedMemory)
        }
      } catch (err) {
        setError('Không thể kết nối. Thử lại.')
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setIsLoading(false)
      }
    },
    [userId, isLoading, onMemoryUpdate, agentId]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, isLoading, error, sendMessage, clearMessages }
}

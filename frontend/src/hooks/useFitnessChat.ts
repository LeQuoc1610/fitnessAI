import { useState, useCallback, useEffect } from 'react'
import type { Message, UserMemory } from '@/types'
import { createClient } from '@/utils/supabase/client'
import { API_BASE } from '@/utils/api'

interface UseFitnessChatOptions {
  userId: string
  onMemoryUpdate?: (memory: Partial<UserMemory>) => void
  agentId?: string
  checkedToday?: boolean
}

/**
 * Hook để quản lý chat với Fitness agent
 * - Fetch lịch sử chat của user
 * - Hiển thị intro message nếu lần đầu
 * - Thêm check-in prompt nếu chưa check-in hôm nay
 * - Xử lý gửi message và cập nhật memory
 */
export function useFitnessChat({ userId, onMemoryUpdate, agentId = 'fitness', checkedToday = true }: UseFitnessChatOptions) {
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
          content: `Tao là **FITNESS**.\n\nKhông phải chatbot thân thiện. Không phải app động viên sáo rỗng.\n\nTao ở đây để thay đổi kết quả thực tế của mày — nếu mày thực sự muốn.\n\nTrước khi bắt đầu, tao cần biết 3 thứ:\n\n**1.** Mục tiêu thực sự: giảm mỡ / tăng cơ / sức bền / tổng thể?\n**2.** Lịch của mày: tập được mấy buổi/tuần, mỗi buổi bao nhiêu phút?\n**3.** Điểm yếu lớn nhất: lười, ăn uống lung tung, hay thiếu kiến thức?\n\nTrả lời đi.`,
          timestamp: new Date().toISOString(),
        }

        const checkPrompt: Message = {
          role: 'assistant',
          content: 'Chưa check-in hôm nay. Hãy hỏi thẳng: "Hôm qua mày có tập không?"',
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
            content: `Tao là **FITNESS**.\n\nKhông phải chatbot thân thiện. Không phải app động viên sáo rỗng.\n\nTao ở đây để thay đổi kết quả thực tế của mày — nếu mày thực sự muốn.`,
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

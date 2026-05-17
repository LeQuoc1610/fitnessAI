import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import { getSupabaseAdmin } from '../lib/supabase-admin'
import { buildFitnessPrompt, extractMemoryUpdate } from '../lib/fitness-prompt'
import { buildNutritionPrompt, extractNutritionMemoryUpdate } from '../lib/nutrition-prompt'
import { generateAI } from '../lib/ai-ollama'
import type { AgentId, Message, UserMemory, ChatResponse } from '../types'

const router = Router()

// Tất cả routes trong file này đều cần xác thực
router.use(requireAuth)

// ─── Helper ──────────────────────────────────────────────────────────────────

function buildPrompt(agentId: AgentId, memory: UserMemory | null, checkedToday: boolean): string {
  switch (agentId) {
    case 'nutrition':
      return buildNutritionPrompt(memory, checkedToday)
    case 'fitness':
    default:
      return buildFitnessPrompt(memory, checkedToday)
  }
}

function extractMemory(
  agentId: AgentId,
  aiText: string
): { cleanText: string; memoryUpdate: Record<string, unknown> | null } {
  switch (agentId) {
    case 'nutrition':
      return extractNutritionMemoryUpdate(aiText)
    case 'fitness':
    default:
      return extractMemoryUpdate(aiText)
  }
}

// ─── GET /api/chat?agentId=fitness ───────────────────────────────────────────
// Lấy toàn bộ lịch sử hội thoại của user với một agent

router.get('/', async (req: Request, res: Response) => {
  try {
    const agentId = (req.query.agentId as string) ?? 'fitness'
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('conversations')
      .select('messages, session_date, created_at')
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true })

    if (error && (error as any).code !== 'PGRST116') {
      return res.status(500).json({ error: error.message })
    }

    const allMessages = (data ?? []).flatMap((c: any) => c.messages ?? [])
    return res.json({ messages: allMessages })
  } catch (err) {
    console.error('[GET /api/chat] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /api/chat ──────────────────────────────────────────────────────────
// Gửi tin nhắn, nhận trả lời từ AI, lưu conversation và cập nhật memory

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, agentId = 'fitness' } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Thiếu nội dung message' })
    }

    const supabase = getSupabaseAdmin()
    const today = new Date().toISOString().split('T')[0]

    // 1. Lấy memory của user với agent này
    const { data: memory } = await supabase
      .from('user_memory')
      .select('*')
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)
      .maybeSingle()

    // 2. Lấy conversation hôm nay (tối đa 20 message gần nhất)
    const { data: todayConv } = await supabase
      .from('conversations')
      .select('id, messages')
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)
      .eq('session_date', today)
      .maybeSingle()

    const recentMessages: Message[] = todayConv?.messages?.slice(-20) ?? []

    // 3. Kiểm tra user đã check-in hôm nay chưa
    const { data: todayCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)
      .eq('session_date', today)
      .maybeSingle()

    const checkedToday = !!todayCheckin?.id

    // 4. Sinh câu trả lời từ AI
    const systemPrompt = buildPrompt(agentId as AgentId, memory, checkedToday)
    const rawText = await generateAI({ message, context: systemPrompt })
    const { cleanText, memoryUpdate } = extractMemory(agentId as AgentId, rawText)

    // 5. Lưu conversation
    const newMessages: Message[] = [
      ...recentMessages,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: cleanText, timestamp: new Date().toISOString() },
    ]

    if (todayConv?.id) {
      await supabase
        .from('conversations')
        .update({ messages: newMessages })
        .eq('id', todayConv.id)
    } else {
      await supabase.from('conversations').insert({
        user_id: req.userId,
        agent_id: agentId,
        messages: newMessages,
        session_date: today,
      })
    }

    // 6. Cập nhật memory (nếu AI trích xuất được thông tin mới)
    const updatedMemory: Partial<UserMemory> = {
      user_id: req.userId,
      agent_id: agentId as AgentId,
      last_active: new Date().toISOString(),
      ...(memoryUpdate as Partial<UserMemory>),
    }

    await supabase
      .from('user_memory')
      .upsert(updatedMemory, { onConflict: 'user_id,agent_id' })

    const result: ChatResponse = {
      message: cleanText,
      updatedMemory: memoryUpdate ? updatedMemory : undefined,
    }

    return res.json(result)
  } catch (err) {
    console.error('[POST /api/chat] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── DELETE /api/chat?agentId=fitness ───────────────────────────────────────
// Xoá toàn bộ conversations và checkins của user với agent này

router.delete('/', async (req: Request, res: Response) => {
  try {
    const agentId = (req.query.agentId as string) ?? 'fitness'
    const supabase = getSupabaseAdmin()

    const { error: convError } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)

    if (convError) return res.status(500).json({ error: convError.message })

    const { error: checkinError } = await supabase
      .from('checkins')
      .delete()
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)

    if (checkinError) return res.status(500).json({ error: checkinError.message })

    return res.json({ success: true, deleted: ['conversations', 'checkins'] })
  } catch (err) {
    console.error('[DELETE /api/chat] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

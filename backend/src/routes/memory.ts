import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import { getSupabaseAdmin } from '../lib/supabase-admin'
import type { UserMemory } from '../types'

const router = Router()
router.use(requireAuth)

// ─── GET /api/memory?agentId=fitness ─────────────────────────────────────────
// Lấy memory hiện tại của user với agent

router.get('/', async (req: Request, res: Response) => {
  try {
    const agentId = (req.query.agentId as string) ?? 'fitness'
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('user_memory')
      .select('*')
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)
      .single()

    if (error && (error as any).code !== 'PGRST116') {
      return res.status(500).json({ error: error.message })
    }

    return res.json({ memory: data ?? null })
  } catch (err) {
    console.error('[GET /api/memory] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── PATCH /api/memory ───────────────────────────────────────────────────────
// Cập nhật một phần memory (merge với dữ liệu cũ)

router.patch('/', async (req: Request, res: Response) => {
  try {
    const { agentId = 'fitness', updates } = req.body

    if (!updates) {
      return res.status(400).json({ error: 'Thiếu trường updates' })
    }

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('user_memory')
      .upsert(
        { user_id: req.userId, agent_id: agentId, ...updates },
        { onConflict: 'user_id,agent_id' }
      )
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    return res.json({ memory: data })
  } catch (err) {
    console.error('[PATCH /api/memory] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── DELETE /api/memory ──────────────────────────────────────────────────────
// Reset toàn bộ memory về trạng thái ban đầu (giữ user_id, agent_id)

router.delete('/', async (req: Request, res: Response) => {
  try {
    const { agentId = 'fitness' } = req.body
    const supabase = getSupabaseAdmin()

    const resetMemory: Partial<UserMemory> = {
      user_id: req.userId,
      agent_id: agentId,
      name: null,
      goal: null,
      level: null,
      schedule: null,
      body_stats: null,
      weaknesses: [],
      motivations: [],
      habits: {},
      current_plan: null,
      check_in_count: 0,
      streak_days: 0,
      last_checkin_at: null,
      last_active: null,
    }

    const { error } = await supabase
      .from('user_memory')
      .upsert(resetMemory, { onConflict: 'user_id,agent_id' })

    if (error) return res.status(500).json({ error: error.message })

    return res.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/memory] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

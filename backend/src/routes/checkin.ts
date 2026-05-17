import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import { getSupabaseAdmin } from '../lib/supabase-admin'

const router = Router()
router.use(requireAuth)

// ─── Helper ──────────────────────────────────────────────────────────────────

function calculateStreak(checkins: { session_date: string }[]): number {
  if (!checkins.length) return 0

  const dates = checkins
    .map((c) => c.session_date)
    .filter((d, i, arr) => arr.indexOf(d) === i) // unique dates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // mới nhất trước

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let streak = 0
  let expectedDate = today

  for (const date of dates) {
    if (date === expectedDate || date === yesterday) {
      streak++
      expectedDate = new Date(new Date(date).getTime() - 86400000).toISOString().split('T')[0]
    } else if (date < expectedDate) {
      break
    }
  }

  return streak
}

// ─── GET /api/checkin?agentId=fitness ────────────────────────────────────────
// Kiểm tra trạng thái check-in hôm nay + thống kê streak

router.get('/', async (req: Request, res: Response) => {
  try {
    const agentId = (req.query.agentId as string) ?? 'fitness'
    const today = new Date().toISOString().split('T')[0]
    const supabase = getSupabaseAdmin()

    const { data: todayCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)
      .eq('session_date', today)
      .maybeSingle()

    const { data: memory } = await supabase
      .from('user_memory')
      .select('check_in_count, streak_days')
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)
      .maybeSingle()

    return res.json({
      checkedToday: !!todayCheckin,
      checkInCount: memory?.check_in_count ?? 0,
      streakDays: memory?.streak_days ?? 0,
    })
  } catch (err) {
    console.error('[GET /api/checkin] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /api/checkin ───────────────────────────────────────────────────────
// Thực hiện check-in cho hôm nay, tính lại streak và cập nhật memory

router.post('/', async (req: Request, res: Response) => {
  try {
    const { agentId = 'fitness', didWorkout = true, note = null } = req.body
    const today = new Date().toISOString().split('T')[0]
    const supabase = getSupabaseAdmin()

    // Kiểm tra đã check-in hôm nay chưa
    const { data: existingCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)
      .eq('session_date', today)
      .maybeSingle()

    if (existingCheckin) {
      return res.status(400).json({ error: 'Bạn đã check-in hôm nay rồi' })
    }

    // Insert checkin mới
    const { error: insertError } = await supabase
      .from('checkins')
      .insert({
        user_id: req.userId,
        agent_id: agentId,
        session_date: today,
        did_workout: didWorkout,
        note,
      })

    if (insertError) return res.status(500).json({ error: insertError.message })

    // Lấy toàn bộ checkins để tính streak
    const { data: allCheckins, error: checkinsError } = await supabase
      .from('checkins')
      .select('session_date')
      .eq('user_id', req.userId)
      .eq('agent_id', agentId)

    if (checkinsError) return res.status(500).json({ error: checkinsError.message })

    const checkInCount = allCheckins?.length ?? 0
    const streakDays = calculateStreak(allCheckins ?? [])

    // Cập nhật user_memory
    const { error: memoryError } = await supabase
      .from('user_memory')
      .upsert(
        {
          user_id: req.userId,
          agent_id: agentId,
          check_in_count: checkInCount,
          streak_days: streakDays,
          last_checkin_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,agent_id' }
      )

    if (memoryError) return res.status(500).json({ error: memoryError.message })

    return res.json({ success: true, checkInCount, streakDays, checkedToday: true })
  } catch (err) {
    console.error('[POST /api/checkin] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

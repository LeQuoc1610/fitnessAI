// ─── Types dùng ở phía frontend ───────────────────────────────────────────────
// Đây là bản copy của backend/src/types/index.ts.
// Khi thêm field mới, cần cập nhật cả hai nơi (hoặc dùng shared package nếu monorepo).

export type AgentId = 'fitness' | 'nutrition' | 'sleep' | 'mental' | 'recovery'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface UserMemory {
  id?: string
  user_id: string
  agent_id: AgentId
  name: string | null
  goal: 'fat_loss' | 'muscle_gain' | 'endurance' | 'general' | null
  level: 'beginner' | 'intermediate' | 'advanced' | null
  schedule: {
    sessions_per_week: number
    duration_min: number
    preferred_days?: string[]
  } | null
  body_stats: {
    weight_kg: number | null
    height_cm: number | null
    body_fat?: number | null
    age?: number | null
  } | null
  weaknesses: string[]
  motivations: string[]
  habits: Record<string, boolean>
  current_plan: WorkoutPlan | null
  check_in_count: number
  streak_days: number
  last_checkin_at?: string | null
  last_active: string | null
  updated_at?: string
}

export interface WorkoutPlan {
  name: string
  duration_weeks: number
  sessions_per_week: number
  weeks: WorkoutWeek[]
  created_at?: string
}

export interface WorkoutWeek {
  week: number
  days: WorkoutDay[]
}

export interface WorkoutDay {
  day: string
  focus: string
  exercises: Exercise[]
}

export interface Exercise {
  name: string
  sets: number
  reps: string
  rest_sec: number
  notes?: string
}

export interface ChatRequest {
  message: string
  agentId?: AgentId
}

export interface ChatResponse {
  message: string
  updatedMemory?: Partial<UserMemory>
  error?: string
}

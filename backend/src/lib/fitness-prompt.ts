import type { UserMemory } from '../types'

const GOAL_LABELS: Record<string, string> = {
  fat_loss: 'Giảm mỡ',
  muscle_gain: 'Tăng cơ',
  endurance: 'Sức bền',
  general: 'Tổng thể',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Người mới bắt đầu',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
}

function buildMemoryContext(memory: UserMemory | null): string {
  if (!memory) return ''

  const lines: string[] = []

  if (memory.name) lines.push(`- Tên: ${memory.name}`)
  if (memory.goal) lines.push(`- Mục tiêu: ${GOAL_LABELS[memory.goal] ?? memory.goal}`)
  if (memory.level) lines.push(`- Cấp độ: ${LEVEL_LABELS[memory.level] ?? memory.level}`)

  if (memory.schedule) {
    lines.push(
      `- Lịch tập: ${memory.schedule.sessions_per_week} buổi/tuần, mỗi buổi ${memory.schedule.duration_min} phút`
    )
    if (memory.schedule.preferred_days?.length) {
      lines.push(`- Ngày ưa thích: ${memory.schedule.preferred_days.join(', ')}`)
    }
  }

  if (memory.body_stats) {
    const stats = memory.body_stats
    const parts: string[] = []
    if (stats.weight_kg) parts.push(`${stats.weight_kg}kg`)
    if (stats.height_cm) parts.push(`${stats.height_cm}cm`)
    if (stats.age) parts.push(`${stats.age} tuổi`)
    if (stats.body_fat) parts.push(`${stats.body_fat}% mỡ`)
    if (parts.length) lines.push(`- Thể trạng: ${parts.join(', ')}`)
  }

  if (memory.weaknesses?.length) lines.push(`- Điểm yếu: ${memory.weaknesses.join(', ')}`)
  if (memory.motivations?.length) lines.push(`- Động lực: ${memory.motivations.join(', ')}`)

  if (memory.current_plan) {
    lines.push(
      `- Kế hoạch hiện tại: "${memory.current_plan.name}" (${memory.current_plan.duration_weeks} tuần)`
    )
  }

  if (memory.streak_days > 0) lines.push(`- Streak: ${memory.streak_days} ngày liên tiếp`)
  if (memory.check_in_count > 0) lines.push(`- Tổng số buổi đã tập: ${memory.check_in_count}`)

  if (!lines.length) return ''
  return `\nHỒ SƠ NGƯỜI DÙNG (đã biết, không hỏi lại):\n${lines.join('\n')}`
}

export function buildFitnessPrompt(memory: UserMemory | null, checkedToday = true): string {
  const memoryContext = buildMemoryContext(memory)

  const checkinInstruction = checkedToday
    ? ''
    : `\n\nLƯU Ý: Người dùng chưa check-in hôm nay. Nếu phù hợp với ngữ cảnh, hỏi nhẹ nhàng về buổi tập hôm qua.`

  const greeting = memory?.name
    ? `Gọi người dùng bằng tên "${memory.name}" để tạo sự gần gũi.`
    : `Chưa biết tên người dùng. Nếu phù hợp, có thể hỏi tên để cá nhân hóa.`

  return `Bạn là FITNESS — AI huấn luyện viên cá nhân trong ứng dụng Healthy.

TÍNH CÁCH CỐT LÕI:
- Hỗ trợ, lịch sự, tôn trọng người dùng
- Chuyên nghiệp, rõ ràng, không vòng vo
- Động viên tích cực, xây dựng thay vì chỉ trích
- ${greeting}

NHIỆM VỤ CỤ THỂ:
- Lập kế hoạch tập luyện với số liệu rõ ràng (sets, reps, thời gian nghỉ)
- Tư vấn dinh dưỡng với con số cụ thể (calo, protein g/kg)
- Check-in tiến độ và động viên
- Xây dựng thói quen dài hạn
${memoryContext}${checkinInstruction}

QUY TẮC TRẢ LỜI:
- Trả lời HOÀN TOÀN bằng tiếng Việt
- KHÔNG chào hỏi lại nếu không phải tin nhắn đầu tiên
- Tối đa 300 từ — ngắn gọn, dễ đọc
- Kết thúc bằng câu hỏi mở hoặc đề xuất hành động tiếp theo
- KHÔNG hỏi lại thông tin đã có trong hồ sơ

MEMORY EXTRACTION:
Khi user cung cấp thông tin cá nhân MỚI, ghi nhận ở CUỐI message:
<memory_update>
{"goal": "fat_loss", "level": "beginner"}
</memory_update>
Chỉ thêm field user VỪA đề cập. Bỏ qua nếu không có thông tin mới.`
}

export function extractMemoryUpdate(aiText: string): {
  cleanText: string
  memoryUpdate: Record<string, unknown> | null
} {
  const match = aiText.match(/<memory_update>([\s\S]*?)<\/memory_update>/)
  if (!match) return { cleanText: aiText, memoryUpdate: null }

  try {
    const memoryUpdate = JSON.parse(match[1].trim())
    const cleanText = aiText.replace(/<memory_update>[\s\S]*?<\/memory_update>/, '').trim()
    return { cleanText, memoryUpdate }
  } catch {
    return {
      cleanText: aiText.replace(/<memory_update>[\s\S]*?<\/memory_update>/, '').trim(),
      memoryUpdate: null,
    }
  }
}

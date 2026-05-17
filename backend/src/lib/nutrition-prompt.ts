import type { UserMemory } from '../types'

function buildNutritionContext(memory: UserMemory | null): string {
  if (!memory) return ''

  const lines: string[] = []

  if (memory.name) lines.push(`- Tên: ${memory.name}`)

  if (memory.goal) {
    const goalMap: Record<string, string> = {
      fat_loss: 'Giảm mỡ',
      muscle_gain: 'Tăng cơ',
      endurance: 'Sức bền',
      general: 'Tổng thể',
    }
    lines.push(`- Mục tiêu: ${goalMap[memory.goal] ?? memory.goal}`)
  }

  if (memory.body_stats) {
    const s = memory.body_stats
    const parts: string[] = []
    if (s.weight_kg) parts.push(`${s.weight_kg}kg`)
    if (s.height_cm) parts.push(`${s.height_cm}cm`)
    if (s.age) parts.push(`${s.age} tuổi`)
    if (s.body_fat) parts.push(`${s.body_fat}% mỡ`)
    if (parts.length) lines.push(`- Thể trạng: ${parts.join(', ')}`)
  }

  if (memory.weaknesses?.length) lines.push(`- Điểm yếu: ${memory.weaknesses.join(', ')}`)

  if (memory.habits && Object.keys(memory.habits).length) {
    const habitList = Object.entries(memory.habits)
      .map(([k, v]) => `${k}: ${v ? 'có' : 'không'}`)
      .join(', ')
    lines.push(`- Thói quen ăn uống: ${habitList}`)
  }

  if (!lines.length) return ''
  return `\nHỒ SƠ NGƯỜI DÙNG (đã biết, không hỏi lại):\n${lines.join('\n')}`
}

export function buildNutritionPrompt(memory: UserMemory | null, checkedToday = true): string {
  const memoryContext = buildNutritionContext(memory)

  const greeting = memory?.name
    ? `Gọi người dùng bằng tên "${memory.name}" để tạo sự gần gũi.`
    : `Chưa biết tên người dùng. Nếu phù hợp, có thể hỏi tên để cá nhân hóa.`

  const checkinNote = checkedToday
    ? ''
    : `\n\nLƯU Ý: Người dùng chưa log bữa ăn hôm nay. Nếu phù hợp, hỏi nhẹ về chế độ ăn hôm nay.`

  return `Bạn là NUTRITION — AI chuyên gia dinh dưỡng trong ứng dụng Healthy.

TÍNH CÁCH CỐT LÕI:
- Khoa học, chính xác, dựa trên số liệu thực tế
- Thực tế và linh hoạt — không cực đoan, không ép chế độ ăn khắt khe
- Cá nhân hóa theo mục tiêu và thể trạng của từng người
- ${greeting}

NHIỆM VỤ CỤ THỂ:
- Tính toán TDEE, calo cần thiết theo mục tiêu
- Tư vấn macro: protein (g/kg), carb, fat theo tỷ lệ phù hợp
- Gợi ý thực đơn cụ thể, thực phẩm dễ tìm tại Việt Nam
- Giải thích tác dụng của thực phẩm, supplements
- Nhận diện thói quen ăn xấu và đề xuất thay thế
${memoryContext}${checkinNote}

QUY TẮC TRẢ LỜI:
- Trả lời HOÀN TOÀN bằng tiếng Việt
- Luôn kèm số liệu cụ thể (g, kcal, tỷ lệ %)
- KHÔNG chào hỏi lại nếu không phải tin nhắn đầu tiên
- Tối đa 300 từ — ngắn gọn, dễ áp dụng
- Kết thúc bằng câu hỏi hoặc hành động tiếp theo
- KHÔNG hỏi lại thông tin đã có trong hồ sơ

MEMORY EXTRACTION:
Khi user cung cấp thông tin mới, ghi nhận ở CUỐI message:
<memory_update>
{"body_stats": {"weight_kg": 70, "height_cm": 170}, "habits": {"an_chay": false}}
</memory_update>
Chỉ thêm field user VỪA đề cập. Bỏ qua nếu không có thông tin mới.`
}

export function extractNutritionMemoryUpdate(aiText: string): {
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

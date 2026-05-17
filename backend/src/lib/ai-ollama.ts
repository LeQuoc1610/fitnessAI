const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const DEFAULT_MODEL = process.env.AI_MODEL || 'qwen2:7b'

interface GenerateAIInput {
  message: string
  context?: string
}

/**
 * Gọi Ollama để sinh câu trả lời AI.
 * context = system prompt (ví dụ: prompt fitness hoặc nutrition)
 */
export async function generateAI(input: string | GenerateAIInput): Promise<string> {
  let prompt: string
  let systemPrompt = 'You are a professional fitness coach AI.'

  if (typeof input === 'string') {
    prompt = input
  } else {
    const { message, context = '' } = input
    if (context) {
      systemPrompt = context
      prompt = message
    } else {
      prompt = message
    }
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/ollama`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'curl/7.68.0',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 512,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Ollama error ${response.status}: ${err}`)
    }

    const data = await response.json() as { message?: { content?: string } }
    return data.message?.content?.trim() ?? ''
  } catch (err: any) {
    console.error('[generateAI] error:', err?.message || err)

    if (err.message?.includes('ECONNREFUSED') || err.message?.includes('fetch failed')) {
      return 'Xin lỗi, không kết nối được Ollama. Hãy chắc chắn Ollama đang chạy (ollama serve).'
    }
    return 'Xin lỗi, AI hiện không khả dụng. Chi tiết: ' + (err?.message || 'Unknown error')
  }
}

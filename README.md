# Healthy App — AI Chatbot cho Fitness & Nutrition

Ứng dụng web tư vấn sức khỏe với 2 AI agents chuyên biệt:
- **Fitness Agent**: Tư vấn bài tập, lập kế hoạch luyện tập
- **Nutrition Agent**: Tư vấn dinh dưỡng, chế độ ăn uống

Kiến trúc Frontend/Backend tách biệt cho dễ deploy, bảo mật, và quản lý code.

---

## Chức năng đã hoàn thành

### 1. Fitness Agent
- Chat tư vấn bài tập và luyện tập
- Lưu trữ profile: chiều cao, cân nặng, mục tiêu tập luyện
- Check-in hàng ngày để track quá trình
- Streak tracking (liên tục bao nhiêu ngày)

### 2. Nutrition Agent
- Chat tư vấn dinh dưỡng và chế độ ăn uống
- Lưu trữ profile: mục tiêu calo, chế độ ăn, dị ứng
- Check-in bữa ăn hàng ngày
- Lịch sử checkin

### 3. Memory System
- Lưu trữ thông tin cá nhân cho từng agent
- Tự động cập nhật từ cuộc trò chuyện
- Có thể xóa dữ liệu bất cứ lúc nào

### 4. Authentication
- Đăng nhập bằng Supabase (OAuth)
- Bảo mật các API endpoints bằng Bearer token
- Service role key chỉ ở backend

### 5. Chat History
- Lưu trữ lịch sử chat trên Supabase
- Xóa chat history độc lập
- Giao diện clean và dễ dùng

---

## Chức năng sắp tới

- **Sleep Agent**: Tư vấn về giấc ngủ và chất lượng giấc ngủ

---

## Cách chạy local

### 1. Backend
```bash
cd backend
npm install
# Tạo file .env với các biến sau:
# SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...
# OLLAMA_BASE_URL=http://localhost:11434
# AI_MODEL=qwen2:7b
# PORT=4000
# FRONTEND_URL=http://localhost:3000

npm run dev            # chạy tại http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
npm install
# Tạo file .env.local với các biến sau:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
# NEXT_PUBLIC_API_URL=http://localhost:4000/api

npm run dev            # chạy tại http://localhost:3000
```

### 3. Ollama (AI Engine)
```bash
# Cài đặt Ollama từ https://ollama.ai
# Chạy model
ollama run qwen2:7b
```

---

## API Endpoints (Backend)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/chat?agentId=fitness` | Lấy lịch sử hội thoại |
| `POST` | `/api/chat` | Gửi tin nhắn, nhận trả lời AI |
| `DELETE` | `/api/chat?agentId=fitness` | Xoá hội thoại |
| `GET` | `/api/checkin?agentId=fitness` | Lấy check-in ngày hôm nay |
| `POST` | `/api/checkin` | Thực hiện check-in |
| `GET` | `/api/memory?agentId=fitness` | Lấy user memory |
| `PATCH` | `/api/memory` | Cập nhật memory |
| `DELETE` | `/api/memory` | Reset memory |
| `GET` | `/health` | Health check |

**Header bắt buộc** (trừ `/health`):
```
Authorization: Bearer <supabase_access_token>
```

---

## Cấu trúc Backend

```
backend/src/
├── index.ts              ← Entry point, khởi động Express server
├── middleware/
│   └── auth.ts           ← Xác thực Bearer token từ Supabase
├── routes/
│   ├── chat.ts           ← GET/POST/DELETE /api/chat
│   ├── checkin.ts        ← GET/POST /api/checkin
│   └── memory.ts         ← GET/PATCH/DELETE /api/memory
├── lib/
│   ├── supabase-admin.ts ← Supabase Admin client
│   ├── ai-ollama.ts      ← Gọi Ollama để sinh AI response
│   ├── fitness-prompt.ts ← System prompt cho Fitness agent
│   └── nutrition-prompt.ts ← System prompt cho Nutrition agent
└── types/
    └── index.ts          ← TypeScript types
```

## Cấu trúc Frontend

```
frontend/src/
├── app/                  ← Next.js App Router
│   ├── (auth)/           ← Trang login
│   ├── (dashboard)/      ← Trang sau khi đăng nhập
│   │   └── agents/
│   │       ├── fitness/  ← Chat với Fitness agent
│   │       └── nutrition/ ← Chat với Nutrition agent
│   └── auth/callback/    ← OAuth callback
├── components/
│   ├── chat/             ← ChatWindow, InputBar, MessageBubble...
│   ├── layout/           ← Sidebar
│   ├── memory/           ← MemoryPanel
│   └── ui/               ← UI components
├── hooks/
│   ├── useFitnessChat.ts ← Logic chat Fitness
│   ├── useNutritionChat.ts ← Logic chat Nutrition
│   ├── useCheckin.ts     ← Logic check-in
│   ├── useMemory.ts      ← Logic memory
│   └── useUser.ts        ← Lấy user info
├── utils/
│   ├── api.ts            ← API base URL
│   └── supabase/         ← Supabase helpers
└── types/
    └── index.ts          ← TypeScript types
```

---

## Biến môi trường

### Backend `.env`
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OLLAMA_BASE_URL=http://localhost:11434
AI_MODEL=qwen2:7b
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Tech Stack

- **Backend**: Express.js, TypeScript, Node.js
- **Frontend**: Next.js, React, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Ollama + Qwen 2 7B model
- **Auth**: Supabase Authentication

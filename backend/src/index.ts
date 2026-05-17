import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import chatRouter from './routes/chat'
import checkinRouter from './routes/checkin'
import memoryRouter from './routes/memory'

const app = express()
const PORT = process.env.PORT || 4000

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/chat', chatRouter)
app.use('/api/checkin', checkinRouter)
app.use('/api/memory', memoryRouter)

// Health check — dùng để kiểm tra server còn sống không
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Backend đang chạy tại http://localhost:${PORT}`)
})

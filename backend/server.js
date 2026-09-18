import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { connectDatabase } from './config/db.js'
import authRoutes from './routes/auth.js'
import examinationRoutes from './routes/examinations.js'
import questionRoutes from './routes/questions.js'
import { requireAuth } from './middleware/auth.js'

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '100kb' }))
app.use('/api/auth', authRoutes)
app.use('/api/exams', examinationRoutes)
app.use('/api/exams/:examId/questions', questionRoutes)
app.use('/api/questions', questionRoutes)

app.get('/api/auth/me', requireAuth, (request, response) => {
  response.json({ user: request.user })
})

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'online-examination-api',
    timestamp: new Date().toISOString(),
  })
})

app.use((_request, response) => {
  response.status(404).json({
    message: 'The requested API endpoint was not found.',
  })
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({
    message: 'An unexpected server error occurred.',
  })
})

async function startServer() {
  try {
    await connectDatabase()
    app.listen(port, () => {
      console.log(`API server running at http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Unable to start the API because MongoDB is unavailable.')
    console.error(error.message)
    process.exitCode = 1
  }
}

startServer()

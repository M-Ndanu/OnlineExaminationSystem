import express from 'express'
import mongoose from 'mongoose'
import { Examination } from '../models/Examination.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()

function isValidId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function studentView(examination) {
  const exam = examination.toObject()
  exam.questions = exam.questions.map((question) => ({
    ...question,
    options: question.options.map(({ isCorrect, ...option }) => option),
  }))
  return exam
}

function canManage(user, examination) {
  return user.role === 'admin' || examination.createdBy.toString() === user._id.toString()
}

router.use(requireAuth)

router.get('/', async (request, response, next) => {
  try {
    const filter = request.user.role === 'student'
      ? { status: 'published' }
      : { createdBy: request.user.role === 'admin' ? { $exists: true } : request.user._id }
    const examinations = await Examination.find(filter).sort({ startsAt: 1 })
    const result = request.user.role === 'student'
      ? examinations.map(studentView)
      : examinations
    return response.json({ examinations: result })
  } catch (error) {
    return next(error)
  }
})

router.get('/:id', async (request, response, next) => {
  try {
    if (!isValidId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid examination ID.' })
    }
    const examination = await Examination.findById(request.params.id)
    if (!examination || (request.user.role === 'student' && examination.status !== 'published')) {
      return response.status(404).json({ message: 'Examination not found.' })
    }
    return response.json({ examination: request.user.role === 'student' ? studentView(examination) : examination })
  } catch (error) {
    return next(error)
  }
})

router.post('/', requireRole('teacher', 'admin'), async (request, response, next) => {
  try {
    const examination = await Examination.create({
      ...request.body,
      createdBy: request.user._id,
      status: 'draft',
    })
    return response.status(201).json({ examination })
  } catch (error) {
    return next(error)
  }
})

router.put('/:id', requireRole('teacher', 'admin'), async (request, response, next) => {
  try {
    if (!isValidId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid examination ID.' })
    }
    const examination = await Examination.findById(request.params.id)
    if (!examination) {
      return response.status(404).json({ message: 'Examination not found.' })
    }
    if (!canManage(request.user, examination)) {
      return response.status(403).json({ message: 'You can only edit examinations you manage.' })
    }

    const allowedFields = ['title', 'courseCode', 'instructions', 'durationMinutes', 'startsAt', 'endsAt', 'questions', 'allowRetake', 'status']
    for (const field of allowedFields) {
      if (field in request.body) examination[field] = request.body[field]
    }
    await examination.save()
    return response.json({ examination })
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', requireRole('teacher', 'admin'), async (request, response, next) => {
  try {
    if (!isValidId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid examination ID.' })
    }
    const examination = await Examination.findById(request.params.id)
    if (!examination) {
      return response.status(404).json({ message: 'Examination not found.' })
    }
    if (!canManage(request.user, examination)) {
      return response.status(403).json({ message: 'You can only delete examinations you manage.' })
    }
    await examination.deleteOne()
    return response.json({ message: 'Examination deleted successfully.' })
  } catch (error) {
    return next(error)
  }
})

export default router

import express from 'express'
import mongoose from 'mongoose'
import { Examination } from '../models/Examination.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router({ mergeParams: true })

function isValidId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function canManage(user, examination) {
  return user.role === 'admin' || examination.createdBy.toString() === user._id.toString()
}

function validateQuestion(question) {
  if (!question?.text || !Number.isFinite(Number(question.marks)) || Number(question.marks) <= 0) {
    return 'Question text and positive marks are required.'
  }
  if (!Array.isArray(question.options) || question.options.length < 4) {
    return 'Each question must have at least four options.'
  }
  if (question.options.filter((option) => option.isCorrect === true).length !== 1) {
    return 'Each question must have exactly one correct option.'
  }
  if (question.options.some((option) => !option.text?.trim())) {
    return 'Every option must have text.'
  }
  return null
}

function studentQuestion(question) {
  const value = question.toObject ? question.toObject() : question
  return {
    ...value,
    options: value.options.map(({ isCorrect, ...option }) => option),
  }
}

async function findExamForUser(request) {
  if (!isValidId(request.params.examId)) return null
  const examination = await Examination.findById(request.params.examId)
  if (!examination || !canManage(request.user, examination)) return null
  return examination
}

router.use(requireAuth)

router.get('/', async (request, response, next) => {
  try {
    if (!isValidId(request.params.examId)) {
      return response.status(400).json({ message: 'Invalid examination ID.' })
    }
    const examination = await Examination.findById(request.params.examId)
    if (!examination || (request.user.role === 'student' && examination.status !== 'published')) {
      return response.status(404).json({ message: 'Examination not found.' })
    }
    const questions = request.user.role === 'student'
      ? examination.questions.map(studentQuestion)
      : examination.questions
    return response.json({ questions })
  } catch (error) {
    return next(error)
  }
})

router.post('/', requireRole('teacher', 'admin'), async (request, response, next) => {
  try {
    const examination = await findExamForUser(request)
    if (!examination) return response.status(404).json({ message: 'Examination not found.' })
    const validationMessage = validateQuestion(request.body)
    if (validationMessage) return response.status(400).json({ message: validationMessage })

    examination.questions.push({
      ...request.body,
      order: examination.questions.length + 1,
    })
    await examination.save()
    return response.status(201).json({ question: examination.questions.at(-1) })
  } catch (error) {
    return next(error)
  }
})

router.put('/:questionId', requireRole('teacher', 'admin'), async (request, response, next) => {
  try {
    if (!isValidId(request.params.questionId)) {
      return response.status(400).json({ message: 'Invalid question ID.' })
    }
    const examination = await Examination.findOne({ 'questions._id': request.params.questionId })
    if (!examination || !canManage(request.user, examination)) {
      return response.status(404).json({ message: 'Question not found.' })
    }
    const validationMessage = validateQuestion(request.body)
    if (validationMessage) return response.status(400).json({ message: validationMessage })

    const question = examination.questions.id(request.params.questionId)
    question.set({ ...request.body, order: question.order })
    await examination.save()
    return response.json({ question })
  } catch (error) {
    return next(error)
  }
})

router.delete('/:questionId', requireRole('teacher', 'admin'), async (request, response, next) => {
  try {
    if (!isValidId(request.params.questionId)) {
      return response.status(400).json({ message: 'Invalid question ID.' })
    }
    const examination = await Examination.findOne({ 'questions._id': request.params.questionId })
    if (!examination || !canManage(request.user, examination)) {
      return response.status(404).json({ message: 'Question not found.' })
    }
    examination.questions.pull(request.params.questionId)
    examination.questions.forEach((question, index) => { question.order = index + 1 })
    await examination.save()
    return response.json({ message: 'Question deleted successfully.' })
  } catch (error) {
    return next(error)
  }
})

export default router

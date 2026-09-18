import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { _id: false },
)

const resultSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0 },
    totalMarks: { type: Number, required: true, min: 0.01 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    gradedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: true,
    },
    startedAt: Date,
    deadlineAt: Date,
    submittedAt: Date,
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'submitted', 'expired'],
      default: 'assigned',
    },
    answers: { type: [answerSchema], default: [] },
    result: { type: resultSchema, default: null },
  },
  { timestamps: true },
)

attemptSchema.index({ student: 1, examination: 1 }, { unique: true })
attemptSchema.index({ examination: 1, status: 1 })

export const Attempt = mongoose.model('Attempt', attemptSchema)

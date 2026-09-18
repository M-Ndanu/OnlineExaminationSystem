import mongoose from 'mongoose'

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    order: { type: Number, required: true, min: 1 },
    isCorrect: { type: Boolean, required: true, default: false },
  },
  { _id: true },
)

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    marks: { type: Number, required: true, min: 0.01 },
    order: { type: Number, required: true, min: 1 },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: (options) => options.length >= 4,
        message: 'Each question must have at least four options.',
      },
    },
  },
  { _id: true },
)

const examinationSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    courseCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
    instructions: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 1440 },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    totalMarks: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    allowRetake: { type: Boolean, default: false },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true },
)

examinationSchema.pre('validate', function validateSchedule() {
  if (this.endsAt <= this.startsAt) {
    this.invalidate('endsAt', 'The examination end time must be after its start time.')
  }
})

examinationSchema.pre('validate', function calculateMarks() {
  this.totalMarks = this.questions.reduce((total, question) => total + question.marks, 0)
})

examinationSchema.index({ startsAt: 1, endsAt: 1 })
examinationSchema.index({ createdBy: 1 })

export const Examination = mongoose.model('Examination', examinationSchema)

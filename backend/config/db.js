import mongoose from 'mongoose'

const defaultMongoUri = 'mongodb://127.0.0.1:27017/online_examination_system'

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || defaultMongoUri
  await mongoose.connect(mongoUri)
  console.log('Connected to MongoDB')
}

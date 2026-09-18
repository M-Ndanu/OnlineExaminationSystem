import bcrypt from 'bcryptjs'
import express from 'express'
import { User } from '../models/User.js'
import { createToken, requireAuth } from '../middleware/auth.js'

const router = express.Router()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    registrationNumber: user.registrationNumber,
  }
}

router.post('/register', async (request, response, next) => {
  try {
    const { email, password, firstName, lastName, registrationNumber, programme, yearOfStudy } = request.body

    if (!emailPattern.test(email ?? '') || !password || password.length < 8 || !firstName || !lastName) {
      return response.status(400).json({
        message: 'Provide a valid email, a password of at least 8 characters, and your full name.',
      })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return response.status(409).json({ message: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'student',
      registrationNumber,
      programme,
      yearOfStudy,
    })

    return response.status(201).json({
      message: 'Student account created successfully.',
      user: publicUser(user),
      token: createToken(user),
    })
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'That email or registration number is already in use.' })
    }
    return next(error)
  }
})

router.post('/login', async (request, response, next) => {
  try {
    const email = request.body.email?.toLowerCase().trim()
    const password = request.body.password
    const user = await User.findOne({ email }).select('+passwordHash')

    if (!user || !user.isActive || !(await bcrypt.compare(password ?? '', user.passwordHash))) {
      return response.status(401).json({ message: 'Invalid email or password.' })
    }

    return response.json({
      message: 'Login successful.',
      user: publicUser(user),
      token: createToken(user),
    })
  } catch (error) {
    return next(error)
  }
})

router.post('/logout', requireAuth, (_request, response) => {
  response.json({ message: 'Logout successful. Remove the token from the client.' })
})

export default router

import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.')
  }
  return process.env.JWT_SECRET
}

export function createToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    getJwtSecret(),
    { expiresIn: '2h' },
  )
}

export async function requireAuth(request, response, next) {
  try {
    const authorization = request.headers.authorization
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null

    if (!token) {
      return response.status(401).json({ message: 'Authentication is required.' })
    }

    const payload = jwt.verify(token, getJwtSecret())
    const user = await User.findById(payload.sub)

    if (!user || !user.isActive) {
      return response.status(401).json({ message: 'Your account is not available.' })
    }

    request.user = user
    return next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return response.status(401).json({ message: 'Your session is invalid or has expired.' })
    }
    return next(error)
  }
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You are not authorized to access this resource.' })
    }
    return next()
  }
}

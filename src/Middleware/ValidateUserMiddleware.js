import { verifyToken } from '@/config/JsonWebToken'
import User from '@/models/User'

const validateUser = async (req, res, next) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).json({ message: 'Unauthorization' })

    const [scheme, token] = req.headers.authorization.split(' ')

    if (scheme !== 'Bearer')
      return res.status(401).json({ message: 'Unauthorization' })
    if (!token) return res.status(401).json({ message: 'Unauthorization' })

    const userVerified = verifyToken(token)
    const user = await User.findOne({ _id: userVerified._id })

    if (!user) {
      return res.status(401).json('Unauthorization')
    }

    req.user = user
    next()
  } catch (error) {
    if (error.message == 'jwt expired') {
      return res.status(401).json({ message: 'Token expired' })
    }
    next(error)
  }
}

export { validateUser }

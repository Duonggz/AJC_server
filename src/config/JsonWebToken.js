import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const createToken = (payload, exp = '1y') =>
  jwt.sign(payload, process.env.SECRET_KEY_JWT, { expiresIn: exp })
const verifyToken = (token) => jwt.verify(token, process.env.SECRET_KEY_JWT)

export { createToken, verifyToken }

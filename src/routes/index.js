import { createToken } from '@/config/JsonWebToken'
import MulterConfig from '@/config/Multer'
import EmitSocketEvent from '@/events/EmitSocket.event'
import { validateUser } from '@/Middleware/ValidateUserMiddleware'
import Config from '@/models/Config'
import User from '@/models/User'
import express from 'express'
import fs from 'fs'
import path from 'path'

// lấy ra bộ định tuyến để định nghĩa các tuyến đường
const router = express.Router()

// bản v1
router.get('/views', async (req, res, next) => {
  try {
    const config = await Config.find()

    if (config.length <= 0) {
      return res.json([])
    }
    return res.json(config[0].views)
  } catch (error) {
    next(error)
  }
})

router.post('/views', async (req, res, next) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    await Config.updateOne(
      {},
      {
        $addToSet: { views: clientIp },
      }
    )

    EmitSocketEvent.emit('addView')

    return res.json({
      message: 'success',
    })
  } catch (error) {
    next(error)
  }
})

router.post('/progress', validateUser, async (req, res, next) => {
  try {
    const { progress } = req.body
    await Config.updateOne(
      {},
      {
        progress: progress,
      }
    )

    EmitSocketEvent.emit('updateProgress', progress)

    return res.json({
      message: 'success',
    })
  } catch (error) {
    next(error)
  }
})

router.get('/progress', async (req, res, next) => {
  try {
    const config = await Config.find()

    if (!config) {
      return res.json(0)
    }
    return res.json(config[0].progress)
  } catch (error) {
    next(error)
  }
})

router.get('/content', async (req, res, next) => {
  try {
    const config = await Config.find()
    const fullUrl = `${req.protocol}://${req.get('host')}/`

    if (!config) {
      return res.json('')
    }
    return res.json(fullUrl + config[0].content)
  } catch (error) {
    next(error)
  }
})

router.post(
  '/content',
  validateUser,
  MulterConfig.single('image'),
  async (req, res, next) => {
    try {
      const file = req.file

      await Config.updateOne(
        {},
        {
          content: `/images/${file.filename}`,
        }
      )

      return res.json({
        message: 'success',
      })
    } catch (error) {
      next(error)
    }
  }
)

router.post('/reset', validateUser, async (req, res, next) => {
  try {
    const config = await Config.find()

    if (config.length <= 0) {
      await Config.create({
        content: '',
        progress: 0,
        views: [],
      })
    } else {
      await Config.updateOne(
        {},
        {
          content: '',
          progress: 0,
          views: [],
        }
      )
    }

    fs.rmSync(path.join(__dirname, '../public/images'), {
      recursive: true,
      force: true,
    })
    fs.mkdirSync(path.join(__dirname, '../public/images'))

    EmitSocketEvent.emit('resetData')

    return res.json({
      message: 'success',
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email })
    if (!user) {
      return res.status(401).json({ message: 'tài khoản không tồn tại' })
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'sai mật khẩu' })
    }

    const token = createToken(user.toObject())

    return res.status(200).json({ user: user, token })
  } catch (error) {
    next(error)
  }
})

export default router

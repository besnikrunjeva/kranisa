import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(401).json({ error: 'invalid credentials' })
  }

  const valid = await bcrypt.compare(password || '', process.env.ADMIN_PASSWORD_HASH || '')
  if (!valid) {
    return res.status(401).json({ error: 'invalid credentials' })
  }

  const token = jwt.sign({ sub: email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

export default router

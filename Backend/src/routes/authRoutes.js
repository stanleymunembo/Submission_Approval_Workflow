const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/db')
const { auth } = require('../middleware/auth')

const router = express.Router()

// POST /api/auth/login 
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!process.env.JWT_SECRET) {
      console.error('Login error: JWT_SECRET is missing. Check Backend/.env')
      return res.status(500).json({ error: 'Server misconfigured' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/auth/me  (test that login token works)
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role FROM users WHERE id = $1',
      [req.user.id]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (err) {
    console.error('Me error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router

const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const applicationRoutes = require('./routes/applicationRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', async (req, res) => {
  try {
    const { pool } = require('./config/db')
    const db = await pool.query('SELECT NOW() AS time')
    const users = await pool.query('SELECT COUNT(*)::int AS count FROM users')
    res.json({
      message: 'Server is running',
      database: 'connected',
      demoUsers: users.rows[0].count,
    })
  } catch (err) {
    res.status(500).json({
      message: 'Server is running but database failed',
      error: err.message,
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/applications', applicationRoutes)

module.exports = app

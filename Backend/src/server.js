const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const app = require('./app')
const { pool, testConnection } = require('./config/db')
const { initDatabase } = require('../Scripts/init_render_db')

const PORT = process.env.PORT || 4000

async function waitForDatabase() {
  for (let attempt = 1; attempt <= 15; attempt++) {
    try {
      await testConnection()
      console.log('Database connected')
      return
    } catch (err) {
      console.error(`Database not ready (${attempt}/15):`, err.message)
      if (attempt === 15) throw err
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
}

async function startServer() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing — login will fail')
  }

  await waitForDatabase()
  try {
    await initDatabase()
  } catch (err) {
    console.error('Database init failed:', err.message)
  }

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err.message)
  pool.end()
  process.exit(1)
})

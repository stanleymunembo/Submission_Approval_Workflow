const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const { Pool } = require('pg')

function createPool() {
  // Render gives you DATABASE_URL — use it when present
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  }

  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
}

const pool = createPool()

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err)
})

async function testConnection() {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT NOW() AS connected_at')
    return result.rows[0]
  } finally {
    client.release()
  }
}

module.exports = { pool, testConnection }

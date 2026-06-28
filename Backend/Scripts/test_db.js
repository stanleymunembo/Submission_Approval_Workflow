const { testConnection, pool } = require('../src/config/db')

async function main() {
  try {
    const result = await testConnection()
    console.log('Database connected successfully at', result.connected_at)
  } catch (err) {
    console.error('Database connection failed:', err.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

main()
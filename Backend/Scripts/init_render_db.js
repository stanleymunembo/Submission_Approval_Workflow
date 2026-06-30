const fs = require('fs')
const path = require('path')
const { pool } = require('../src/config/db')

async function initDatabase() {
  const check = await pool.query(
    "SELECT to_regclass('public.users') AS table_name"
  )

  if (check.rows[0].table_name) {
    console.log('Database already set up — skipping init')
    return
  }

  console.log('First run — creating tables and demo data...')

  const sqlDir = path.join(__dirname, 'sql')
  const schema = fs.readFileSync(
    path.join(sqlDir, '001_create_schema.sql'),
    'utf8'
  )
  const seed = fs.readFileSync(
    path.join(sqlDir, '002_seed_data.sql'),
    'utf8'
  )

  await pool.query(schema)
  await pool.query(seed)

  console.log('Database ready (demo users created)')
}

module.exports = { initDatabase }

const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const { pool } = require('../src/config/db')

async function seedDemoData() {
  const passwordHash = await bcrypt.hash('Password123!', 10)

  await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role) VALUES
     ($1, $2, 'Jane Applicant', 'applicant'),
     ($3, $2, 'Ray Reviewer', 'reviewer')`,
    ['applicant@demo.com', passwordHash, 'reviewer@demo.com']
  )

  await pool.query(
    `INSERT INTO applications (owner_id, title, category, description, amount, status)
     VALUES (
       (SELECT id FROM users WHERE email = 'applicant@demo.com'),
       'Office laptop upgrade', 'Equipment', 'Need a laptop for development work.', 1200.00, 'DRAFT'
     )`
  )

  await pool.query(
    `INSERT INTO applications (owner_id, title, category, description, amount, status, submitted_at)
     VALUES (
       (SELECT id FROM users WHERE email = 'applicant@demo.com'),
       'Conference travel', 'Travel', 'Travel for developer conference.', 850.00, 'SUBMITTED', NOW()
     )`
  )

  await pool.query(
    `INSERT INTO applications (owner_id, title, category, description, requested_date, status, submitted_at)
     VALUES (
       (SELECT id FROM users WHERE email = 'applicant@demo.com'),
       'Security training', 'Training', 'Team security training.', '2026-07-28', 'UNDER_REVIEW', NOW()
     )`
  )

  console.log('Demo users and applications created')
}

async function initDatabase() {
  const tables = await pool.query(
    "SELECT to_regclass('public.users') AS users_table"
  )

  if (!tables.rows[0].users_table) {
    console.log('Creating tables...')
    const schema = fs.readFileSync(
      path.join(__dirname, 'sql', '001_create_schema.sql'),
      'utf8'
    )
    await pool.query(schema)
  }

  const users = await pool.query('SELECT COUNT(*)::int AS count FROM users')
  if (users.rows[0].count === 0) {
    console.log('Seeding demo data...')
    await seedDemoData()
  } else {
    console.log('Database already has users — skipping seed')
  }
}

module.exports = { initDatabase }

require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../src/config/db')

async function main() {
  const email = 'applicant@demo.com'
  const password = 'Password123!'

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  const user = result.rows[0]

  if (!user) {
    console.log('User not found')
    return
  }

  console.log('User columns:', Object.keys(user))

  const match = await bcrypt.compare(password, user.password_hash)
  console.log('Password match:', match)

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )
  console.log('Token created:', token.slice(0, 30) + '...')
}

main()
  .catch((err) => console.error('Error:', err.message))
  .finally(() => pool.end())

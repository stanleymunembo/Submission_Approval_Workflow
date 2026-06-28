require('dotenv').config()

//The pg module is the postgres module that allows easir communication to the database
const { Pool } = require('pg')

//This is the connection poll that initialises the database parameters from the env file.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

//On fail a message is thrown
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err)
})


//Test the database connection to postgres database.  (npm run db:test---command used to test the database coonection in the terminal)
async function testConnection() {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT NOW() AS connected_at')
    return result.rows[0]
  } finally {
    client.release()
  }
}

//This file will be use in the other folders, will need to export it for use.
module.exports = { pool, testConnection }
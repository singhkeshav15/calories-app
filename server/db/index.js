import pg from 'pg'
const { Pool } = pg
import dotenv from 'dotenv'
dotenv.config()

// Use DATABASE_URL (Neon/production) if available, otherwise use individual vars (local)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }  // required for Neon
    })
  : new Pool({
      user:     process.env.DB_USER,
      host:     process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port:     process.env.DB_PORT,
    })

export default pool
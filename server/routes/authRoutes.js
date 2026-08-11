import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/index.js'
import express from 'express'
const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all the fields' })
    }

    try {
        // Check if email already exists
        const existing = await pool.query('SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)', [email])
        if (existing.rows[0].exists) {
            return res.status(400).json({ message: 'Email already registered' })
        }

        // Hash password + insert user
        const hashedPass = await bcrypt.hash(password, 10)
        const result = await pool.query(
            'INSERT INTO users(email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPass]
        )
        const newUser = result.rows[0]

        // Create token + respond
        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(201).json({ token, user: newUser })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        // Find user by email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        if (!result.rows[0]) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // Compare password
        const user = result.rows[0]
        const isPassCorrect = await bcrypt.compare(password, user.password)
        if (!isPassCorrect) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // Create token + respond
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(200).json({
            token,
            user: { id: user.id, email: user.email }
        })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

export default router

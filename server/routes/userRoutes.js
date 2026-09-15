import express from 'express'
import pool from '../db/index.js'
import authMiddleware from '../middleware/auth.js'
import calculateTDEE from '../utils/tdee.js'

const router = express.Router()

// GET /api/user/profile — get logged-in user's profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, age, gender, height_cm, weight_kg, activity_level, goal, daily_goal, goal_set_by FROM users WHERE id = $1',
            [req.user.userId]
        )
        res.json(result.rows[0])
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// PUT /api/user/profile — save profile + set daily goal
router.put('/profile', authMiddleware, async (req, res) => {
    const { goal_set_by, daily_goal, age, gender, height_cm, weight_kg, activity_level, goal } = req.body

    try {
        let finalGoal

        if (goal_set_by === 'calculated') {
            // Validate all required fields for TDEE
            if (!age || !gender || !height_cm || !weight_kg || !activity_level || !goal) {
                return res.status(400).json({ message: 'All fields required for calculation' })
            }
            // Calculate using TDEE formula
            finalGoal = calculateTDEE(age, gender, height_cm, weight_kg, activity_level, goal)

            await pool.query(
                `UPDATE users SET
                    age = $1, gender = $2, height_cm = $3, weight_kg = $4,
                    activity_level = $5, goal = $6,
                    daily_goal = $7, goal_set_by = 'calculated'
                WHERE id = $8`,
                [age, gender, height_cm, weight_kg, activity_level, goal, finalGoal, req.user.userId]
            )
        } else {
            // Manual mode — use provided number directly
            if (!daily_goal || daily_goal <= 0) {
                return res.status(400).json({ message: 'Please enter a valid calorie goal' })
            }
            finalGoal = daily_goal

            await pool.query(
                `UPDATE users SET daily_goal = $1, goal_set_by = 'manual' WHERE id = $2`,
                [finalGoal, req.user.userId]
            )
        }

        // Return updated profile
        const updated = await pool.query(
            'SELECT id, email, age, gender, height_cm, weight_kg, activity_level, goal, daily_goal, goal_set_by FROM users WHERE id = $1',
            [req.user.userId]
        )
        res.json(updated.rows[0])
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

export default router

import express from 'express'
import pool from '../db/index.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// GET all foods for a specific date → /api/foods?date=2024-09-15
router.get('/foods', authMiddleware, async(req, res) => {
    try {
        // Use provided date or default to today
        const date = req.query.date || new Date().toISOString().split('T')[0]

        const result = await pool.query(
            'SELECT * FROM foods WHERE user_id = $1 AND logged_date = $2 ORDER BY id ASC',
            [req.user.userId, date]
        )
        res.json(result.rows)
    }
    catch(err) {
        res.status(500).json({ message: err.message })
    }
})

// GET weekly summary → /api/foods/weekly
// IMPORTANT: must be defined before /foods/:id so Express doesn't treat "weekly" as an id
router.get('/foods/weekly', authMiddleware, async (req, res) => {
    try {
        // Get last 7 days of data grouped by date
        const result = await pool.query(
            `SELECT
                logged_date,
                SUM(calories)::integer AS total_calories,
                SUM(protein)::numeric(10,1) AS total_protein
            FROM foods
            WHERE user_id = $1
                AND logged_date >= CURRENT_DATE - INTERVAL '6 days'
                AND logged_date <= CURRENT_DATE
            GROUP BY logged_date
            ORDER BY logged_date ASC`,
            [req.user.userId]
        )

        // Build a full 7-day array — fill missing days with 0
        const dataMap = {}
        result.rows.forEach(row => {
            dataMap[row.logged_date.toISOString().split('T')[0]] = {
                calories: row.total_calories,
                protein: parseFloat(row.total_protein)
            }
        })

        const days = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })

            days.push({
                date: dateStr,
                day: dayName,
                calories: dataMap[dateStr]?.calories || 0,
                protein: dataMap[dateStr]?.protein || 0
            })
        }

        res.json(days)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// GET single food by id → /api/foods/:id
router.get('/foods/:id', authMiddleware, async (req, res) => {
    try{
        const userId = req.user.userId 
        const result = await pool.query('SELECT * FROM foods WHERE user_id = $1', [userId])
        res.json(result.rows[0]);
    }
    catch(err){
        res.status(500).json(err.message);
    }
})

// POST - add new food → /api/foods
router.post('/foods', authMiddleware, async (req, res) => {
    const { name, calories, protein, logged_date } = req.body
    if (!name || !calories || !protein) {
        return res.status(400).json({ message: 'name, calories and protein are required' })
    }

    // Default to today if no date provided
    const date = logged_date || new Date().toISOString().split('T')[0]

    try {
        const result = await pool.query(
            'INSERT INTO foods (name, calories, protein, user_id, logged_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, calories, protein, req.user.userId, date]
        )
        res.json(result.rows[0])
    }
    catch(err) {
        res.status(500).json({ message: err.message })
    }
})

// DELETE food by id → /api/foods/:id
router.delete('/foods/:id',authMiddleware, async (req, res) => {
    try{
        const userId = req.user.userId
        const result = await pool.query('DELETE FROM foods WHERE id = $1 AND user_id = $2', [req.params.id, userId])
        res.status(200).json("Food is deleted")
    }
    catch(err){
        res.status(500).json(err.message)
    }
})



export default router
import express from 'express'
import pool from '../db/index.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// GET all foods → /api/foods
router.get('/foods', authMiddleware, async(req, res) => {
    try{
        const result = await pool.query('SELECT * FROM foods WHERE user_id = $1', [req.user.userId])
        res.json(result.rows)
    }
    catch(err){
        res.status(500).json(err.message);
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
router.post('/foods',authMiddleware, async (req, res) =>{
    const {name, calories, protein} = req.body
    if (!name || !calories || !protein) {
        return res.status(400).json({ message: 'name, calories and protein are required' })
    }

    try{
        const result = await pool.query('INSERT INTO foods (name, calories, protein, user_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, calories, protein, req.user.userId])
        res.json(result.rows[0]);
    }
    catch(err){
        res.status(500).json(err.message)
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
import express from 'express'
import pool from '../db/index.js'

const router = express.Router()

// GET all foods → /api/foods
router.get('/foods', async(req, res) => {
    try{
        const result = await pool.query('SELECT * FROM foods ORDER BY logged_at DESC')
        res.json(result.rows)
    }
    catch(err){
        res.status(500).json(err.message);
    }

})

// GET single food by id → /api/foods/:id
router.get('/foods/:id', async (req, res) => {
    try{
        const id = req.params.id
        const result = await pool.query('SELECT * FROM foods WHERE id = $1', [id])
        res.json(result.rows[0]);
    }
    catch(err){
        res.status(500).json(err.message);
    }
})

// POST - add new food → /api/foods
router.post('/foods', async (req, res) =>{
    const {name, calories, protein} = req.body
    if (!name || !calories || !protein) {
        return res.status(400).json({ message: 'name, calories and protein are required' })
    }

    try{
        const result = await pool.query('INSERT INTO foods (name, calories, protein) VALUES ($1, $2, $3) RETURNING *', [name, calories, protein])
        res.json(result.rows[0]);
    }
    catch(err){
        res.status(500).json(err.message)
    }
})

// DELETE food by id → /api/foods/:id
router.delete('/foods/:id', async (req, res) => {
    try{
        const id = req.params.id
        const result = await pool.query('DELETE FROM foods WHERE id = $1', [id])
        res.status(200).json("Food is deleted")
    }
    catch(err){
        res.status(500).json(err.message)
    }
})



export default router
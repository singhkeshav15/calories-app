import express from 'express'
import foods from '../data/food.js'

const router = express.Router()

// GET all foods → /api/foods
router.get('/foods', (req, res) => {
    res.json(foods)
})

// GET single food by id → /api/foods/:id
router.get('/foods/:id', (req, res) => {
    const id = Number(req.params.id)
    const food = foods.find(food => food.id === id)

    if (!food) {
        return res.status(404).json({ message: 'Food not found' })
    }

    res.json(food)
})

// POST - add new food → /api/foods
router.post('/foods', (req, res) => {
    const { name, calories } = req.body

    // Input validation
    if (!name || !calories) {
        return res.status(400).json({ message: 'name and calories are required' })
    }
    if (typeof calories !== 'number' || calories <= 0) {
        return res.status(400).json({ message: 'calories must be a positive number' })
    }

    const newFood = {
        id: Date.now(),
        ...req.body
    }
    foods.push(newFood)

    res.status(201).json({ message: 'Food added successfully', data: newFood })
})

// DELETE food by id → /api/foods/:id
router.delete('/foods/:id', (req, res) => {
    const id = Number(req.params.id)
    const idx = foods.findIndex(food => food.id === id)

    if (idx === -1) {
        return res.status(404).json({ message: 'Food not found' })
    }

    const deleted = foods.splice(idx, 1)
    res.status(200).json({ message: 'Food deleted successfully', data: deleted })
})



export default router
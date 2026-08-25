import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

router.get('/search', async (req, res) => {
    const { q } = req.query
    if (!q) {
        return res.status(400).json({ message: 'Search query required' })
    }

    try {
        const response = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&api_key=${process.env.USDA_API_KEY}&pageSize=6`
        )

        if (!response.ok) {
            console.error('USDA API error:', response.status, response.statusText)
            return res.status(500).json({ message: `USDA API error: ${response.status}` })
        }

        const data = await response.json()

        if (!data.foods || data.foods.length === 0) {
            return res.json([])
        }

        // Normalize USDA response into clean objects
        const results = data.foods.map(food => {
            const nutrients = food.foodNutrients || []

            // Nutrient ID 1008 = Energy (kcal), 1003 = Protein
            const calNutrient = nutrients.find(n => n.nutrientId === 1008)
            const proteinNutrient = nutrients.find(n => n.nutrientId === 1003)

            const calories = calNutrient ? Math.round(calNutrient.value) : 0
            const protein = proteinNutrient ? parseFloat(proteinNutrient.value.toFixed(1)) : 0

            return {
                food_name: food.description,
                calories,
                protein,
                description: `Per 100g — Cal: ${calories}kcal | Protein: ${protein}g`
            }
        })

        res.json(results)
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch food data', error: err.message })
    }
})

export default router
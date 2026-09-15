import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// POST /api/ai/estimate — takes food description, returns calories + protein
router.post('/estimate', async (req, res) => {
    const { description } = req.body

    if (!description || !description.trim()) {
        return res.status(400).json({ message: 'Please describe what you ate' })
    }

    // Sanitize — limit length to prevent abuse
    const sanitized = description.trim().slice(0, 500)

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

        // Structured prompt — forces JSON output, no explanation
        const prompt = `You are a nutrition estimation API.
The user ate: "${sanitized}"

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "calories": <total calories as integer>,
  "protein": <total protein in grams as number with 1 decimal>,
  "items": [
    { "name": "<food item>", "calories": <number>, "protein": <number> }
  ],
  "note": "<one short sentence about accuracy if needed, else empty string>"
}

Rules:
- Estimate for a typical serving size if not specified
- If the input is not food related, return { "error": "Not a valid food description" }
- Return ONLY the JSON object, nothing else`

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        // Remove markdown code blocks if model adds them anyway
        const cleaned = text.replace(/```json|```/g, '').trim()

        const parsed = JSON.parse(cleaned)

        // Validate response has required fields
        if (parsed.error) {
            return res.status(400).json({ message: parsed.error })
        }
        if (!parsed.calories || !parsed.protein) {
            return res.status(500).json({ message: 'Could not estimate — try describing your meal differently' })
        }

        // Ensure values are sensible numbers
        parsed.calories = Math.round(Math.abs(parsed.calories))
        parsed.protein = parseFloat(Math.abs(parsed.protein).toFixed(1))

        res.json(parsed)
    }
    catch (err) {
        // JSON parse failed or API error
        console.error('AI estimation error:', err.message)
        if (err instanceof SyntaxError) {
            return res.status(500).json({ message: 'AI returned unexpected format — try again' })
        }
        res.status(500).json({ message: err.message || 'Estimation failed' })
    }
})

export default router

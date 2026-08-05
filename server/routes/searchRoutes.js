import express from 'express'
import getAccessToken from '../utils/fatSecretAuth.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

router.get('/search', async(req, res) =>{
    const {q} = req.query
    if(!q){
        return res.status(400).json({ message: 'Search query required' })
    }
    try{
        const token = await getAccessToken()
        const response = await fetch(
        `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(q)}&format=json&max_results=5`,
        { headers: { 'Authorization': `Bearer ${token}` } }
        )
        const data = await response.json()
        res.json(data.foods.food)
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch food data', error: err.message })
    }
    
})

export default router
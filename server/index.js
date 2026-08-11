import express from "express"
import cors from "cors"
import dotenv from 'dotenv'
dotenv.config()

import foodRouter from './routes/foodRoutes.js'
import searchRouter from './routes/searchRoutes.js'
import authRouter from './routes/authRoutes.js'


const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', foodRouter)
app.use('/api', searchRouter)
app.use('/api/auth', authRouter)

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})

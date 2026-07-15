import express from "express"
import cors from "cors"
import dotenv from 'dotenv'
dotenv.config()

import foodRouter from './routes/foodRoutes.js'


const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', foodRouter)

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})

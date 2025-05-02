import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js";
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import reviewRouter from "./routes/reviewRoute.js"

// App Config
const app = express()
const port = process.env.PORT || 4000

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))

// Middleware
app.use(express.json())

// Connect to MongoDB
connectDB()

// Connect to Cloudinary
connectCloudinary()

// api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/review', reviewRouter)

app.get('/',(req,res)=>{
    res.send('API Working')    
})

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

import express from 'express'
import { addToCart, getCart } from '../controllers/cartController.js'
import authUser from '../middleware/auth.js'

const cartRouter = express.Router()

// Cart routes
cartRouter.post('/add', authUser, addToCart)
cartRouter.get('/get', authUser, getCart)

export default cartRouter





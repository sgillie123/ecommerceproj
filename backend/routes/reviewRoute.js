import express from "express"
import { addReview, getProductReviews } from "../controllers/reviewController.js"
import authUser from "../middleware/auth.js"

const reviewRouter = express.Router()

// Add a new review (requires authentication)
reviewRouter.post("/add", authUser, addReview)

// Get reviews for a product (public)
reviewRouter.get("/product/:productId", getProductReviews)

export default reviewRouter
import reviewModel from "../models/reviewModel.js"
import userModel from "../models/userModel.js"

// Add a new review
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body
    const userId = req.user._id

    // Get user name from database
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" })
    }

    // Create a new review
    const userName = user.name || user.email.split('@')[0]

    const newReview = new reviewModel({
      productId,
      userId,
      userName,
      rating,
      comment,
      date: Date.now(),
    })

    await newReview.save()
    res.json({ success: true, message: "Review added successfully", review: newReview })
  } catch (error) {
    console.error("Review error:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params
    const reviews = await reviewModel.find({ productId }).sort({ date: -1 })

    // Calculate average rating
    let totalRating = 0
    reviews.forEach((review) => {
      totalRating += review.rating
    })
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0

    res.json({
      success: true,
      reviews,
      stats: {
        count: reviews.length,
        averageRating,
      },
    })
  } catch (error) {
    console.error("Get reviews error:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export { addReview, getProductReviews }

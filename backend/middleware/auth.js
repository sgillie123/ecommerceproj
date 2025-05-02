import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js' // Import userModel to verify user exists

const authUser = async (req, res, next) => {
    const { token } = req.headers

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' })
    }
    
    try {
        // 1. Verify token and decode user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // 2. Check if user exists in DB
        const user = await userModel.findById(decoded.id)
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' })
        }

        // 3. Attach user object to request
        req.user = user
        next()
    } catch (error) {
        console.error('Auth error:', error)
        res.status(401).json({ success: false, message: 'Invalid token' })
    }
}

export default authUser
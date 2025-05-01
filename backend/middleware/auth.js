import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js' // Import userModel to verify user exists

const authUser = async (req, res, next) => {
    const { token } = req.headers

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' })
    }
    
    try {
        // 1. Verify token and decode user ID
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        
        // 2. Check if user exists in DB (optional but recommended)
        const user = await userModel.findById(token_decode.id)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // 3. Attach userId to req (NOT req.body!)
        req.userId = token_decode.id // ✅ Critical fix
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ success: false, message: 'Invalid token' })
    }
}

export default authUser
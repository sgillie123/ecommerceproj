import userModel from "../models/userModel.js";

// Add or update cart items
const addToCart = async (req, res) => {
    try {
        const { cartData } = req.body;
        const userId = req.user._id; // Get ID from user object

        const user = await userModel.findByIdAndUpdate(
            userId,
            { cartData },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            message: "Cart updated successfully",
            cartData: user.cartData
        });
    } catch (error) {
        console.error('Cart update error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get cart items
const getCart = async (req, res) => {
    try {
        const userId = req.user._id; // Get ID from user object
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            cartData: user.cartData || {}
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export { addToCart, getCart };
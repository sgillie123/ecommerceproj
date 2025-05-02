import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import { response } from "express";
import jwt from "jsonwebtoken";
import validator from "validator";

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
}
// Route for user login
const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body

        const user = await userModel.findOne({email});
        if (!user) {
            return res.json({success:false, message:"User does not exist!"})
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id)
            res.json({
                success: true,
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    address: user.address
                }
            })
        } else {
            res.json({success:false, message:"Invalid credentials!"})
        }

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

// Route for user registration
const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        // checking user already exists or not 
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({success:false, message:"User already exists!"})
        } 
        // validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"Please enter a valid email!"})
            
        }
        if (password.length < 8) {
            return res.json({success:false, message:"Please enter a strong password!"})   
        }
        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name, 
            email, 
            password: hashedPassword,
            cartData: {}
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({success:true,token})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
        
    }
    
}

// Route for admin login

const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid Credentials"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

// Route for user profile update
const updateUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { firstName, lastName, email, phone, address } = req.body;

        // Find user by ID
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update user fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        
        // Update address if provided
        if (address) {
            user.address = {
                ...user.address,
                ...address
            };
        }

        await user.save();

        // Return only necessary user data
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address
        };

        res.json({ success: true, message: "Profile updated successfully", user: userData });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Route for verifying token and refreshing user data
const verifyToken = async (req, res) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: "No token provided" })
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Get fresh user data
        const user = await userModel.findById(decoded.id)
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        // Return success with fresh user data
        res.json({ 
            success: true, 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                address: user.address
            }
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Invalid token" })
    }
}

export { loginUser, registerUser, adminLogin, updateUser, verifyToken }
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zipcode: { type: String }
    },
    cartData: { type: Object, default: {} }
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
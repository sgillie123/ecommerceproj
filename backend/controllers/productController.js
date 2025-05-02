import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for addproduct
const addProduct = async (req,res) => {
    try {
        const {name, description, price, category, subCategory, sizes, bestseller, displayOrder } = req.body

        // Validate required fields
        if (!name || !description || !price || !category || !subCategory) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate files
        if (!req.files || !req.files.image1) {
            return res.status(400).json({
                success: false,
                message: "At least one image is required"
            });
        }

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1,image2,image3,image4].filter((item)=> item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, {resource_type:'image'});
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            subCategory,
            price: Number(price),
            bestseller: bestseller === "true" ? true : false,
            sizes: Array.isArray(sizes) ? sizes : JSON.parse(sizes || "[]"),
            image: imagesUrl,
            displayOrder: Number(displayOrder) || 0,
            date: Date.now()
        }
        console.log('Creating product with data:', productData); // Debug log

        const product = new productModel(productData);
        await product.save()
        
        console.log('Product saved successfully:', product); // Debug log
        res.status(201).json({success:true, message:"Product Added", product})
    } catch (error) {
        console.error('Error adding product:', error); // Debug log
        res.status(500).json({success:false, message: error.message})
    }
}

//function for list product
const listProducts = async (req,res) => {
    try {
        const products = await productModel.find({}).sort({ displayOrder: 1 });
        res.json({success:true,products})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//function for removing product
const removeProduct = async (req,res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product removed."})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const updateProduct = async (req, res) => {
    try {
      const { id, name, description, price, category, subCategory, sizes, bestseller, displayOrder } = req.body;
  
      // Create update object with only provided fields
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = Number(price);
      if (category !== undefined) updateData.category = category;
      if (subCategory !== undefined) updateData.subCategory = subCategory;
      if (sizes !== undefined) updateData.sizes = sizes;
      if (bestseller !== undefined) updateData.bestseller = bestseller;
      if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
  
      const updated = await productModel.findByIdAndUpdate(id, updateData, { new: true });
  
      if (!updated) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
  
      res.json({ success: true, message: "Product updated successfully", updated });
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ success: false, message: "Update failed", error: err.message });
    }
};
  
// function for single product info
const singleProduct = async (req, res) => {
    try {
      const { id } = req.body;
  
      const product = await productModel.findById(id);
  
      if (!product) {
        return res.json({ success: false, message: "Product not found." });
      }
  
      res.json({ success: true, product });
  
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  
export { listProducts, addProduct, removeProduct, singleProduct, updateProduct };

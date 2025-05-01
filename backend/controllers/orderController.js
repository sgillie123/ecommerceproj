import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import Stripe from "stripe"

//global variables
const currency = "USD"
const deliveryCharge = 10

//gateway initlaize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Placing orders using COD
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    }
    const newOrder = new orderModel(orderData)
    await newOrder.save()

    await userModel.findByIdAndUpdate(userId, { cartData: {} })
    res.json({ success: true, message: "Order Placed" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Placing orders using Stripe
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body
    const { origin } = req.headers

    // Log the items for debugging
    console.log("Items received for Stripe:", JSON.stringify(items))

    // Create the order in the database
    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    }
    const newOrder = new orderModel(orderData)
    await newOrder.save()

    // Create line items for Stripe
    const line_items = items.map((item) => {
      // Format the item name to include size information
      let itemName = item.name || "Product"
      if (item.size && item.size !== "CAKE") {
        const sizeDisplay = item.size === "6" ? "Half Dozen" : item.size === "12" ? "Dozen" : "Single"
        itemName = `${itemName} (${sizeDisplay})`
      }

      // Ensure price is a valid number and convert to cents
      const priceInCents = Math.round((Number.parseFloat(item.price) || 0) * 100)

      return {
        price_data: {
          currency: currency,
          product_data: {
            name: itemName,
          },
          unit_amount: priceInCents,
        },
        quantity: Number.parseInt(item.quantity) || 1,
      }
    })

    // Add delivery charge as a separate line item
    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    })

    // Log the line items for debugging
    console.log("Line items for Stripe:", JSON.stringify(line_items))

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    })

    res.json({ success: true, session_url: session.url })
  } catch (error) {
    console.log("Stripe error:", error)
    res.status(error.statusCode || 500).json({ success: false, message: error.message })
  }
}

// Verify Stripe payment
const verifyStripe = async (req, res) => {
  try {
    const { orderId, success, userId } = req.body

    console.log("Verifying Stripe payment:", { orderId, success, userId })

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" })
    }

    if (success === "true") {
      // Update the order to mark payment as successful
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        {
          payment: true,
          status: "Paid", // Add status field to indicate payment is complete
        },
        { new: true }, // Return the updated document
      )

      console.log("Updated order:", updatedOrder)

      // Clear the user's cart if userId is provided
      if (userId) {
        await userModel.findByIdAndUpdate(userId, { cartData: {} })
      }

      return res.json({ success: true, message: "Payment verified successfully" })
    } else {
      // If payment failed, delete the order
      await orderModel.findByIdAndDelete(orderId)
      return res.json({ success: false, message: "Payment was not successful" })
    }
  } catch (error) {
    console.log("Verification error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// All orders for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 }) // Sort by date, newest first
    res.json({ success: true, orders })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// User order data for frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body
    const orders = await orderModel.find({ userId }).sort({ date: -1 }) // Sort by date, newest first
    res.json({ success: true, orders })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// update status from admin panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body
    await orderModel.findByIdAndUpdate(orderId, { status })
    res.json({ success: true, message: "Status Updated" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus, verifyStripe }

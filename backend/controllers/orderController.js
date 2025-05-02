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
    const { userId, items, amount, address, paymentMethod } = req.body;

    // Validate required fields
    if (!userId || !items || !amount || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide userId, items, amount, and address."
      });
    }

    // Validate address object
    if (!address.street || !address.city || !address.state || !address.country || !address.zipcode) {
      return res.status(400).json({
        success: false,
        message: "Invalid address. Please provide street, city, state, country, and zipcode."
      });
    }

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: paymentMethod || "COD",
      payment: false,
      date: Date.now(),
      status: "Order Placed"
    };

    console.log('Creating order with data:', orderData); // Debug log

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
    const { orderId, success } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (success === 'true') {
      order.payment = true;
      order.status = 'Order Placed';
      await order.save();
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Stripe verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
    // Get userId from the authenticated user in the request
    const userId = req.user._id
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

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    // Find the order
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if user is admin or order belongs to user
    if (!req.headers.isAdmin && order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this order" });
    }

    // Delete the order
    await orderModel.findByIdAndDelete(orderId);
    
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus, verifyStripe, deleteOrder }

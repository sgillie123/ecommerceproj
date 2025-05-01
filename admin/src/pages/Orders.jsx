import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) return null;
    try {
      const apiUrl = `${backendUrl}/api/order/list`;
      const response = await axios.post(apiUrl, {}, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const apiUrlHand = `${backendUrl}/api/order/status`;
      const response = await axios.post(apiUrlHand, {orderId, status:event.target.value}, {headers:{token}});
      if (response.data.success) {
        await fetchAllOrders()
        
      }
    } catch (error) {
      console.log(error);
      toast.error(response.data.message)
      
    }
    
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const sizeLabels = {
    "1": "one",
    "6": "a half-dozen",
    "12": "a dozen"
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h3 className="text-3xl font-bold text-[#C586A5] mb-8">Your Orders</h3>

      <div className="space-y-6">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-[#ffebf5] hover:border-[#C586A5] transition-colors duration-300"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Order Summary */}
              <div className="flex items-start space-x-4">
                <img
                  src={assets.parcel_icon}
                  alt="Order"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h4 className="font-bold text-lg text-[#C586A5] mb-2">Order #{index + 1}</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <p
                        key={index}
                        className={`text-gray-700 ${index === order.items.length - 1 ? '' : 'border-b border-[#ffebf5] pb-1'}`}
                      >
                        {item.name} × {item.quantity}{' '}
                        <span className="text-[#C586A5]">({sizeLabels[item.size] || item.size})</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shipping Info - Neutral Version */}
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm">
                <h5 className="font-semibold text-gray-800 mb-2">Shipping Info</h5>
                <p className="text-gray-900 font-medium">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <div className="text-gray-700 text-sm mt-1">
                  <p>{order.address.street},</p>
                  <p>{order.address.city}, {order.address.state}</p>
                  <p>{order.address.country}, {order.address.zipcode}</p>
                  <p className="mt-2">📞 {order.address.phone}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment:</span>
                  <span
                    className={`font-medium ${order.payment ? 'text-green-600' : 'text-amber-600'}`}
                  >
                    {order.payment ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(order.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#ffebf5]">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-xl font-bold text-[#C586A5]">
                    {currency}{order.amount.toFixed(2)}
                  </span>
                </div>

                <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className="w-full mt-3 p-2 border border-[#C586A5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C586A5] text-sm">
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

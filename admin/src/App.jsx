import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import Sidebar from "./components/Sidebar"
import { Route, Routes } from "react-router-dom"
import Add from "./pages/Add"
import List from "./pages/List"
import Orders from "./pages/Orders"
import Login from "./components/Login"
import { ToastContainer } from "react-toastify"

// Ensure the backend URL has the correct format with trailing slash if needed
export const backendUrl = import.meta.env.VITE_BACKEND_URL
  ? import.meta.env.VITE_BACKEND_URL.endsWith("/")
    ? import.meta.env.VITE_BACKEND_URL.slice(0, -1)
    : import.meta.env.VITE_BACKEND_URL
  : "http://localhost:4000"

// Define currency symbol as a separate export
export const currency = "$"

console.log("Backend URL:", backendUrl)

const App = () => {
  const [token, setToken] = useState("")

  // Load token from localStorage on initial render
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    if (savedToken) {
      setToken(savedToken)
      console.log("Token loaded from localStorage")
    }
  }, [])

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token)
      console.log("Token saved to localStorage")
    } else {
      localStorage.removeItem("token")
      console.log("Token removed from localStorage")
    }
  }, [token])

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                {/* Add a default route */}
                <Route path="*" element={<Add token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App

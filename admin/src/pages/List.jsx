import axios from "axios"
import { useEffect, useState } from "react"
import { backendUrl, currency } from "../App"
import { toast } from "react-toastify"

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    sizes: [],
    bestseller: false,
    displayOrder: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`)
      if (response.data?.success && response.data.products) {
        // Sort products by displayOrder
        const sortedProducts = response.data.products.sort((a, b) => a.displayOrder - b.displayOrder)
        setList(sortedProducts)
      } else {
        toast.error("No products found")
      }
    } catch (error) {
      console.error("Error fetching product list:", error)
      toast.error(error.message || "Failed to load products")
    }
  }

  const moveProduct = async (productId, direction) => {
    try {
      const currentIndex = list.findIndex(item => item._id === productId)
      if (currentIndex === -1) return

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= list.length) return

      // Create a copy of the list
      const updatedList = [...list]
      
      // Swap the products in the list
      const temp = updatedList[currentIndex]
      updatedList[currentIndex] = updatedList[newIndex]
      updatedList[newIndex] = temp

      // Update displayOrder for both products
      updatedList[currentIndex].displayOrder = currentIndex
      updatedList[newIndex].displayOrder = newIndex

      // Update both products in a single request
      const response = await axios.post(`${backendUrl}/api/product/update`, {
        id: productId,
        displayOrder: currentIndex
      }, { headers: { token } })

      if (response.data.success) {
        // Update the other product
        await axios.post(`${backendUrl}/api/product/update`, {
          id: updatedList[newIndex]._id,
          displayOrder: newIndex
        }, { headers: { token } })

        setList(updatedList)
      } else {
        toast.error("Failed to update product order")
      }
    } catch (error) {
      console.error("Error moving product:", error)
      toast.error("Failed to reorder product")
    }
  }

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(`${backendUrl}/api/product/remove`, { id }, {
        headers: { token }
      })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error("Error removing product:", error)
      toast.error(error.message || "Failed to remove product")
    }
  }

  const confirmDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      removeProduct(id)
    }
  }

  const startEditing = (product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      sizes: product.sizes || [],
      bestseller: product.bestseller || false,
      displayOrder: product.displayOrder || 0,
    })
  }

  const cancelEditing = () => {
    setEditingProduct(null)
    setEditForm({
      name: "",
      description: "",
      price: "",
      category: "",
      subCategory: "",
      sizes: [],
      bestseller: false,
      displayOrder: 0,
    })
  }

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const toggleSize = (size) => {
    setEditForm((prev) => {
      const sizes = [...prev.sizes]
      return {
        ...prev,
        sizes: sizes.includes(size)
          ? sizes.filter((s) => s !== size)
          : [...sizes, size],
      }
    })
  }

  useEffect(() => {
    if (editForm.category === "Cakes") {
      setEditForm((prev) => ({ ...prev, sizes: ["CAKE"] }))
    } else if (editForm.sizes.includes("CAKE") && editForm.sizes.length === 1) {
      setEditForm((prev) => ({ ...prev, sizes: [] }))
    }
  }, [editForm.category])

  const saveProductChanges = async () => {
    if (isSubmitting) return
    try {
      setIsSubmitting(true)

      if (!editingProduct || !editingProduct._id) {
        toast.error("No product selected for editing")
        return
      }

      const updateData = {
        id: editingProduct._id,
        ...editForm,
      }

      const response = await axios.post(`${backendUrl}/api/product/update`, updateData, {
        headers: { token }
      })

      if (response.data.success) {
        toast.success("Product updated successfully")
        cancelEditing()
        await fetchList()
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        toast.error(response.data.message || "Failed to update product")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error(error.message || "Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-3 rounded shadow text-sm text-gray-600">Saving changes...</div>
        </div>
      )}

      <p className="mb-2">All Products List</p>
      <div className="flex flex-col gap-2">
        <div className="hidden md:grid md:grid-cols-[1fr_3fr_1fr_1fr_2fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Actions</b>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-4">No products found</div>
        ) : (
          list.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_2fr] items-center py-1 px-2 border bg-gray-100 text-sm"
              key={index}
            >
              <img className="w-12" src={item.image && item.image[0]} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <div className="flex justify-end md:justify-center gap-4">
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => moveProduct(item._id, 'up')} 
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button 
                    onClick={() => moveProduct(item._id, 'down')} 
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    disabled={index === list.length - 1}
                  >
                    ↓
                  </button>
                </div>
                <button onClick={() => startEditing(item)} className="text-blue-600 hover:text-blue-800">
                  Edit
                </button>
                <button onClick={() => confirmDelete(item._id)} className="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Product: {editingProduct.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">--Select one--</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Cupcakes">Cupcakes</option>
                    <option value="Cakes">Cakes</option>
                    <option value="Muffins">Muffins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sub Category</label>
                  <select
                    name="subCategory"
                    value={editForm.subCategory}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">--Select one--</option>
                    <option value="Vanilla">Vanilla</option>
                    <option value="Chocolate">Chocolate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditFormChange}
                  step="0.01"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sizes</label>
                <div className="flex flex-wrap gap-3">
                  {editForm.category !== "Cakes" ? (
                    ["One", "Half-Dozen", "Dozen"].map((size) => (
                      <div onClick={() => toggleSize(size)} className="cursor-pointer" key={size}>
                        <p className={`${editForm.sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"} px-3 py-1`}>
                          {size}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center">
                      <p className="bg-pink-100 px-3 py-1">CAKE</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-bestseller"
                  name="bestseller"
                  checked={editForm.bestseller}
                  onChange={handleEditFormChange}
                  className="mr-2"
                />
                <label htmlFor="edit-bestseller" className="cursor-pointer">
                  Add to bestseller
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={editForm.displayOrder}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={saveProductChanges}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default List

import { useState, useEffect } from "react"
import { assets } from "../assets/assets"
import axios from "axios"
import { backendUrl } from "../App"
import { toast } from "react-toastify"

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("Cookies")
  const [sizes, setSizes] = useState([])
  const [bestseller, setBestseller] = useState(false)

  // Add an effect to handle category changes
  useEffect(() => {
    // When category changes to Cakes, reset sizes and set to CAKE only
    if (category === "Cakes") {
      setSizes(["CAKE"])
    }
    // When changing from Cakes to another category, remove CAKE from sizes
    else if (sizes.includes("CAKE") && sizes.length === 1) {
      setSizes([])
    }
  }, [category])

  const onSubmitHandler = async (e) => {
    e.preventDefault() // Prevent the default form submission

    try {
      // Form data handling and axios POST request
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subcategory)
      formData.append("sizes", JSON.stringify(sizes))
      formData.append("bestseller", bestseller)

      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      const apiUrl = backendUrl + "/api/product/add"

      const response = await axios.post(apiUrl, formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        setName("")
        setDescription("")
        setImage1("")
        setImage2("")
        setImage3("")
        setImage4("")
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2">
          <label htmlFor="image1">
            <img className="w-20" src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
          </label>
          <label htmlFor="image2">
            <img className="w-20" src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
          </label>
          <label htmlFor="image3">
            <img className="w-20" src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
          </label>
          <label htmlFor="image4">
            <img className="w-20" src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
          </label>
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
        />
      </div>
      <div className="w-full">
        <p className="mb-2">Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Write content here"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div className="w-full">
          <p className="mb-2">Product category</p>
          <select onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2">
            <option value="--Select one--">--Select one--</option>
            <option value="Cookies">Cookies</option>
            <option value="Cupcakes">Cupcakes</option>
            <option value="Cakes">Cakes</option>
            <option value="Muffins">Muffins</option>
          </select>
        </div>
        <div className="w-full">
          <p className="mb-2">Sub category</p>
          <select onChange={(e) => setSubcategory(e.target.value)} className="w-full px-3 py-2">
            <option value="--Select one--">--Select one--</option>
            <option value="Vanilla">Vanilla</option>
            <option value="Chocolate">Chocolate</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="Number"
            
            placeholder="25"
          />
        </div>
      </div>

      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {category !== "Cakes" && (
            <>
              <div
                onClick={() =>
                  setSizes((prev) => (prev.includes("One") ? prev.filter((item) => item !== "One") : [...prev, "One"]))
                }
              >
                <p className={`${sizes.includes("One") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>
                  One
                </p>
              </div>
              <div
                onClick={() =>
                  setSizes((prev) =>
                    prev.includes("Half-Dozen")
                      ? prev.filter((item) => item !== "Half-Dozen")
                      : [...prev, "Half-Dozen"],
                  )
                }
              >
                <p
                  className={`${sizes.includes("Half-Dozen") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}
                >
                  Half-Dozen
                </p>
              </div>
              <div
                onClick={() =>
                  setSizes((prev) =>
                    prev.includes("Dozen") ? prev.filter((item) => item !== "Dozen") : [...prev, "Dozen"],
                  )
                }
              >
                <p className={`${sizes.includes("Dozen") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>
                  Dozen
                </p>
              </div>
            </>
          )}

          {category === "Cakes" ? (
            // For cakes, automatically select CAKE and show it as selected
            <div className="flex items-center">
              <p className="bg-pink-100 px-3 py-1">CAKE</p>
              {/* Hidden effect - automatically include CAKE in sizes when category is Cakes */}
              {!sizes.includes("CAKE") && setSizes(["CAKE"])}
            </div>
          ) : (
            // For non-cakes, show the CAKE option as optional with the label
            <>
              <div className="flex gap-3 items-center">
                <p className="text-gray-600">Choose ONLY for Cake:</p>
              </div>
              <div
                onClick={() =>
                  setSizes((prev) =>
                    prev.includes("CAKE") ? prev.filter((item) => item !== "CAKE") : [...prev, "CAKE"],
                  )
                }
              >
                <p className={`${sizes.includes("CAKE") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>
                  CAKE
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <input onChange={() => setBestseller((prev) => !prev)} checked={bestseller} type="checkbox" id="bestseller" />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
        ADD
      </button>
    </form>
  )
}

export default Add
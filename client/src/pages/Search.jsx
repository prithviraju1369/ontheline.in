import { useState } from 'react'
import { Search as SearchIcon, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ondcAPI, cartAPI } from '../utils/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Search() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setCart = useCartStore((state) => state.setCart)
  
  const [searchParams, setSearchParams] = useState({
    query: '',
    pincode: '',
    category: ''
  })
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchParams.query && !searchParams.category) {
      toast.error('Please enter a search term or select a category')
      return
    }

    setIsSearching(true)

    try {
      const response = await ondcAPI.search(searchParams)
      toast.success('Search request sent! Results will appear shortly.')
      
      // In a real implementation, you would poll for results or use websockets
      // For now, we'll just show a message
      setTimeout(() => {
        // Mock results for demonstration
        setSearchResults([
          {
            id: '1',
            name: 'Sample Product 1',
            description: 'This is a sample product',
            price: { currency: 'INR', value: 999 },
            images: ['https://via.placeholder.com/300'],
            providerId: 'provider1',
            providerName: 'Sample Store'
          }
        ])
        setIsSearching(false)
      }, 2000)
    } catch (error) {
      setIsSearching(false)
      console.error('Search error:', error)
    }
  }

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }

    try {
      const cartItem = {
        providerId: product.providerId,
        providerName: product.providerName,
        bppId: product.bppId || 'sample-bpp',
        bppUri: product.bppUri || 'https://sample-bpp.com',
        itemId: product.id,
        itemName: product.name,
        itemDescriptor: {
          name: product.name,
          images: product.images,
          shortDesc: product.description
        },
        price: product.price,
        quantity: 1
      }

      const response = await cartAPI.addToCart(cartItem)
      setCart(response.data.cart)
      toast.success('Item added to cart!')
    } catch (error) {
      console.error('Add to cart error:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Products</h1>

      {/* Search Form */}
      <div className="card mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Query
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchParams.query}
                  onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
                  className="input-field pl-10"
                  placeholder="Search for products..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchParams.pincode}
                  onChange={(e) => setSearchParams({ ...searchParams, pincode: e.target.value })}
                  className="input-field pl-10"
                  placeholder="560001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={searchParams.category}
                onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
                className="input-field"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Kitchen</option>
                <option value="books">Books</option>
                <option value="groceries">Groceries</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="btn-primary w-full md:w-auto disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Search Results */}
      {isSearching ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching ONDC network...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {searchResults.map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
              <p className="text-sm text-gray-500 mb-2">By {product.providerName}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xl font-bold text-primary-600">
                  ₹{product.price.value}
                </span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn-primary text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchIcon size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Start searching to discover products on ONDC network</p>
        </div>
      )}
    </div>
  )
}


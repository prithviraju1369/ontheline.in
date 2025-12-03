import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cartAPI } from '../utils/api'
import { useCartStore } from '../store/cartStore'

export default function Cart() {
  const navigate = useNavigate()
  const { cart, setCart, updateItemQuantity, removeItem } = useCartStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart()
      setCart(response.data.cart)
    } catch (error) {
      console.error('Fetch cart error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      const response = await cartAPI.updateCart(itemId, { quantity: newQuantity })
      setCart(response.data.cart)
      updateItemQuantity(itemId, newQuantity)
    } catch (error) {
      console.error('Update quantity error:', error)
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await cartAPI.removeFromCart(itemId)
      setCart(response.data.cart)
      removeItem(itemId)
      toast.success('Item removed from cart')
    } catch (error) {
      console.error('Remove item error:', error)
    }
  }

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.price.value * item.quantity)
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
          <Link to="/search" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.itemId} className="card flex items-center space-x-4">
              <img
                src={item.itemDescriptor.images?.[0] || 'https://via.placeholder.com/100'}
                alt={item.itemName}
                className="w-24 h-24 object-cover rounded-lg"
              />
              
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{item.itemName}</h3>
                <p className="text-sm text-gray-500">By {item.providerName}</p>
                <p className="text-lg font-bold text-primary-600 mt-2">
                  ₹{item.price.value}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleUpdateQuantity(item.itemId, item.quantity - 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Minus size={20} />
                </button>
                <span className="font-semibold w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Plus size={20} />
                </button>
              </div>

              <button
                onClick={() => handleRemoveItem(item.itemId)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-primary-600">₹{calculateTotal()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-3"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/search"
              className="block text-center mt-4 text-primary-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


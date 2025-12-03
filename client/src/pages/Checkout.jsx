import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { MapPin, CreditCard } from 'lucide-react'
import { cartAPI, orderAPI, userAPI } from '../utils/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

export default function Checkout() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { cart, clearCart } = useCartStore()
  
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('ON-ORDER')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 0,
    longitude: 0
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await userAPI.getAddresses()
      setAddresses(response.data.addresses)
      
      // Select default address if available
      const defaultAddr = response.data.addresses.find(addr => addr.isDefault)
      if (defaultAddr) {
        setSelectedAddress(defaultAddr)
      }
    } catch (error) {
      console.error('Fetch addresses error:', error)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    
    try {
      const response = await userAPI.addAddress(newAddress)
      setAddresses([...addresses, response.data.address])
      setSelectedAddress(response.data.address)
      setShowAddressForm(false)
      toast.success('Address added successfully')
    } catch (error) {
      console.error('Add address error:', error)
    }
  }

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.price.value * item.quantity)
    }, 0)
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }

    setIsLoading(true)

    try {
      const orderData = {
        billingAddress: {
          name: selectedAddress.name,
          email: user.email,
          phone: selectedAddress.phone,
          address: {
            door: '',
            name: selectedAddress.name,
            building: selectedAddress.addressLine2 || '',
            street: selectedAddress.addressLine1,
            locality: selectedAddress.city,
            city: selectedAddress.city,
            state: selectedAddress.state,
            country: selectedAddress.country || 'India',
            areaCode: selectedAddress.pincode
          }
        },
        deliveryAddress: {
          ...selectedAddress,
          latitude: selectedAddress.latitude || 12.9716,
          longitude: selectedAddress.longitude || 77.5946
        },
        paymentMethod
      }

      const response = await orderAPI.createOrder(orderData)
      
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/orders/${response.data.order.orderId}`)
    } catch (error) {
      console.error('Place order error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <MapPin className="mr-2" size={24} />
                Delivery Address
              </h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="btn-secondary text-sm"
              >
                {showAddressForm ? 'Cancel' : 'Add New Address'}
              </button>
            </div>

            {showAddressForm ? (
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    required
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address Line 1"
                  required
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Address Line 2"
                  value={newAddress.addressLine2}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                  className="input-field"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    required
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="input-field"
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Save Address
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    onClick={() => setSelectedAddress(address)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAddress?._id === address._id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <p className="font-semibold">{address.name}</p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {address.addressLine1}, {address.addressLine2}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <CreditCard className="mr-2" size={24} />
              Payment Method
            </h2>

            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-300">
                <input
                  type="radio"
                  name="payment"
                  value="ON-ORDER"
                  checked={paymentMethod === 'ON-ORDER'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <p className="font-semibold">Pay on Order</p>
                  <p className="text-sm text-gray-600">Pay when order is placed</p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-300">
                <input
                  type="radio"
                  name="payment"
                  value="POST-FULFILLMENT"
                  checked={paymentMethod === 'POST-FULFILLMENT'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <p className="font-semibold">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when delivered</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.itemId} className="flex justify-between text-sm">
                  <span>{item.itemName} × {item.quantity}</span>
                  <span>₹{item.price.value * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-semibold">₹0</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-primary-600">₹{calculateTotal()}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || !selectedAddress}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {isLoading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


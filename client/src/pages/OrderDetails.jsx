import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Package, MapPin, CreditCard, Phone, X, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { orderAPI } from '../utils/api'

export default function OrderDetails() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await orderAPI.getOrder(orderId)
      setOrder(response.data.order)
    } catch (error) {
      console.error('Fetch order details error:', error)
      toast.error('Failed to load order details')
      navigate('/orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrackOrder = async () => {
    try {
      const response = await orderAPI.trackOrder(orderId)
      toast.success('Tracking information updated')
      console.log('Tracking:', response.data)
    } catch (error) {
      console.error('Track order error:', error)
    }
  }

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      toast.error('Please provide a cancellation reason')
      return
    }

    try {
      await orderAPI.cancelOrder(orderId, {
        reasonId: '001',
        reason: cancelReason
      })
      toast.success('Order cancelled successfully')
      setShowCancelDialog(false)
      fetchOrderDetails()
    } catch (error) {
      console.error('Cancel order error:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'CREATED': 'bg-blue-100 text-blue-800',
      'ACCEPTED': 'bg-green-100 text-green-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (!order) {
    return null
  }

  const canCancel = order.status !== 'CANCELLED' && order.status !== 'COMPLETED'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/orders')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-gray-600">Order #{order.orderId}</p>
          </div>
        </div>
        
        <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <Package className="mr-2" size={24} />
              Order Items
            </h2>
            
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                  <img
                    src={item.descriptor?.images?.[0] || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-lg font-bold text-primary-600">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <MapPin className="mr-2" size={24} />
              Delivery Address
            </h2>
            
            {order.fulfillment?.end?.location ? (
              <div>
                <p className="font-semibold">{order.billing?.name}</p>
                <p className="text-sm text-gray-600">{order.billing?.phone}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {order.fulfillment.end.location.address?.street},
                  {order.fulfillment.end.location.address?.locality}
                </p>
                <p className="text-sm text-gray-600">
                  {order.fulfillment.end.location.address?.city},
                  {order.fulfillment.end.location.address?.state} -
                  {order.fulfillment.end.location.address?.areaCode}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No delivery address available</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="card">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <CreditCard className="mr-2" size={24} />
              Payment Information
            </h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold">{order.payment?.type || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className={`font-semibold ${order.payment?.status === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                  {order.payment?.status || 'NOT-PAID'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20 space-y-6">
            {/* Order Summary */}
            <div>
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{order.quote?.price?.value || order.payment?.amount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span>₹0</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary-600">
                    ₹{order.quote?.price?.value || order.payment?.amount || 0}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === 'IN_PROGRESS' && (
                <button onClick={handleTrackOrder} className="w-full btn-primary">
                  Track Order
                </button>
              )}
              
              {canCancel && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="w-full btn-secondary text-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
              
              <button className="w-full btn-secondary flex items-center justify-center">
                <Phone size={18} className="mr-2" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Cancel Order</h3>
              <button onClick={() => setShowCancelDialog(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please provide a reason for cancelling this order:
            </p>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="input-field min-h-24 mb-4"
              placeholder="Enter cancellation reason..."
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 btn-secondary"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


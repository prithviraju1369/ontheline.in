import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import { orderAPI } from '../utils/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      const params = filter ? { status: filter } : {}
      const response = await orderAPI.getOrders(params)
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Fetch orders error:', error)
    } finally {
      setIsLoading(false)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        
        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="">All Orders</option>
          <option value="CREATED">Created</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No orders found</h2>
          <p className="text-gray-600 mb-6">Start shopping to create your first order</p>
          <Link to="/search" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.orderId}
              to={`/orders/${order.orderId}`}
              className="card hover:shadow-lg transition-shadow block"
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="text-sm text-gray-700">
                        {item.name} (×{item.quantity})
                        {idx < Math.min(order.items.length, 3) - 1 && ','}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-sm text-gray-500">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <p className="text-lg font-bold text-primary-600">
                    Total: ₹{order.quote?.price?.value || order.payment?.amount || 0}
                  </p>
                </div>
                
                <ChevronRight className="text-gray-400 flex-shrink-0 ml-4" size={24} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


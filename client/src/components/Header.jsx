import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Search, LogOut, Package } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

export default function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const cartItemCount = useCartStore((state) => state.getCartItemCount())

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            OnTheLine
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Search size={20} />
              <span>Search</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link to="/orders" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <Package size={20} />
                  <span>Orders</span>
                </Link>
                
                <Link to="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors relative">
                  <ShoppingCart size={20} />
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <User size={20} />
                  <span className="hidden md:inline">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


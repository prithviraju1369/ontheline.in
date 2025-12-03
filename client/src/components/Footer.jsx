export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About OnTheLine</h3>
            <p className="text-gray-300">
              Your gateway to the Open Network for Digital Commerce (ONDC). 
              Discover products from multiple sellers on a unified platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/search" className="text-gray-300 hover:text-white">Search Products</a></li>
              <li><a href="/orders" className="text-gray-300 hover:text-white">My Orders</a></li>
              <li><a href="/profile" className="text-gray-300 hover:text-white">My Profile</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">
              Email: support@ontheline.in<br />
              Phone: +91 1234567890
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2025 OnTheLine. Powered by ONDC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


import { useState, useEffect } from 'react'
import { User, MapPin, Plus, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { authAPI, userAPI } from '../utils/api'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  })
  const [addresses, setAddresses] = useState([])
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await userAPI.getAddresses()
      setAddresses(response.data.addresses)
    } catch (error) {
      console.error('Fetch addresses error:', error)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    
    try {
      const response = await authAPI.updateProfile(profileData)
      updateUser(response.data.user)
      setIsEditingProfile(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Update profile error:', error)
    }
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingAddress) {
        await userAPI.updateAddress(editingAddress._id, addressForm)
        toast.success('Address updated successfully')
      } else {
        await userAPI.addAddress(addressForm)
        toast.success('Address added successfully')
      }
      
      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      })
      fetchAddresses()
    } catch (error) {
      console.error('Address submit error:', error)
    }
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setAddressForm(address)
    setShowAddressForm(true)
  }

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      await userAPI.deleteAddress(addressId)
      toast.success('Address deleted successfully')
      fetchAddresses()
    } catch (error) {
      console.error('Delete address error:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <User className="mr-2" size={24} />
                Profile Information
              </h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input-field bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 btn-primary">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false)
                      setProfileData({ name: user?.name || '', phone: user?.phone || '' })
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{user?.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Addresses */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <MapPin className="mr-2" size={24} />
                Saved Addresses
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus size={18} className="mr-1" />
                  Add Address
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} className="mb-6 p-4 border-2 border-primary-200 rounded-lg">
                <h3 className="font-semibold mb-4">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Name"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="input-field"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Address Line 1"
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  className="input-field mb-4"
                />

                <input
                  type="text"
                  placeholder="Address Line 2"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  className="input-field mb-4"
                />

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="input-field"
                  />
                </div>

                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Set as default address</span>
                </label>

                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 btn-primary">
                    {editingAddress ? 'Update' : 'Save'} Address
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false)
                      setEditingAddress(null)
                      setAddressForm({
                        name: '',
                        phone: '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        pincode: '',
                        isDefault: false
                      })
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No addresses saved yet. Add your first address!
                </p>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address._id}
                    className="p-4 border-2 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{address.name}</p>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.addressLine1}, {address.addressLine2}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-full"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


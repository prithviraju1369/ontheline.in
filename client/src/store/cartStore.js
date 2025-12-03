import { create } from 'zustand'

export const useCartStore = create((set) => ({
  cart: { items: [] },
  isLoading: false,
  
  setCart: (cart) => set({ cart }),
  
  addItem: (item) => set((state) => ({
    cart: {
      ...state.cart,
      items: [...state.cart.items, item]
    }
  })),
  
  updateItemQuantity: (itemId, quantity) => set((state) => ({
    cart: {
      ...state.cart,
      items: state.cart.items.map(item => 
        item.itemId === itemId ? { ...item, quantity } : item
      )
    }
  })),
  
  removeItem: (itemId) => set((state) => ({
    cart: {
      ...state.cart,
      items: state.cart.items.filter(item => item.itemId !== itemId)
    }
  })),
  
  clearCart: () => set({ cart: { items: [] } }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  getCartTotal: () => {
    const { cart } = useCartStore.getState()
    return cart.items.reduce((total, item) => {
      return total + (item.price.value * item.quantity)
    }, 0)
  },
  
  getCartItemCount: () => {
    const { cart } = useCartStore.getState()
    return cart.items.reduce((count, item) => count + item.quantity, 0)
  }
}))


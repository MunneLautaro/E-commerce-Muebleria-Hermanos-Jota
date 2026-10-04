import { useMemo, useState } from "react"
import { CartContext } from "./CartContext"

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])

  const addItem = (product, quantity = 1) => {
    if (!product || !product.id) return

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id)

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + Math.max(1, quantity) }
            : item,
        )
      }

      return [
        ...currentCart,
        { id: product.id, quantity: Math.max(1, quantity) },
      ]
    })
  }

  const updateQuantity = (productId, delta) => {
    setCart((currentCart) =>
      currentCart.flatMap((item) => {
        if (item.id !== productId) return [item]

        const nextQuantity = item.quantity + delta
        return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : []
      }),
    )
  }

  const removeItem = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId),
    )
  }

  const clearCart = () => setCart([])

  const value = useMemo(
    () => ({
      cart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount: cart.length,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [cart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

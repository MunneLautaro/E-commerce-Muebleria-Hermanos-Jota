
import { useMemo, useState } from "react"
import { CartContext } from "./CartContext"

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])

  const addItem = (product, quantity = 1) => {
    if (!product || !product._id) return

    const stock = Number(product.stock)
    const amount = Number(quantity)

    if (
      !Number.isFinite(stock) ||
      stock <= 0 ||
      !Number.isInteger(amount) ||
      amount < 1
    ) {
      return
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product._id,
      )

      const currentQuantity = existingItem?.quantity ?? 0

      if (currentQuantity + amount > stock) {
        return currentCart
      }

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product._id
            ? { ...item, quantity: currentQuantity + amount }
            : item,
        )
      }

      return [...currentCart, { id: product._id, quantity: amount }]
    })
  }

  const updateQuantity = (productId, delta, stock) => {
    const availableStock = Number(stock)

    if (!Number.isFinite(availableStock) || availableStock < 0) {
      return
    }

    if (!Number.isInteger(delta)) {
      return
    }

    setCart((currentCart) =>
      currentCart.flatMap((item) => {
        if (item.id !== productId) return [item]

        const nextQuantity = item.quantity + delta

        if (nextQuantity <= 0) return []

        if (nextQuantity > availableStock) return [item]

        return [{ ...item, quantity: nextQuantity }]
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

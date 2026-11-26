
import { useCallback, useEffect, useMemo, useState } from "react"
import { CartContext } from "./CartContext"

export const CART_STORAGE_KEY = "hj-cart"

const loadStoredCart = () => {
  if (typeof window === "undefined") return []

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!storedCart) return []

    const parsedCart = JSON.parse(storedCart)
    if (!Array.isArray(parsedCart)) return []

    return parsedCart.flatMap((item) => {
      if (
        typeof item?.id !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return []
      }
      return [{ id: item.id, quantity: item.quantity }]
    })
  } catch (error) {
    console.error("No se pudo recuperar el carrito guardado.", error)
    return []
  }
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadStoredCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error("No se pudo guardar el carrito.", error)
    }
  }, [cart])

  const addItem = useCallback((product, quantity = 1) => {
    if (!product?._id) return

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
  }, [])

  const updateQuantity = useCallback((productId, delta, stock) => {
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
  }, [])

  const setItemQuantity = useCallback((productId, quantity, stock) => {
    const availableStock = Number(stock)
    const nextQuantity = Number(quantity)

    if (
      typeof productId !== "string" ||
      !Number.isFinite(availableStock) ||
      !Number.isInteger(nextQuantity)
    ) {
      return
    }

    setCart((currentCart) => {
      if (nextQuantity <= 0 || availableStock <= 0) {
        return currentCart.filter((item) => item.id !== productId)
      }

      return currentCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(nextQuantity, availableStock) }
          : item,
      )
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId),
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const value = useMemo(
    () => ({
      cart,
      addItem,
      updateQuantity,
      setItemQuantity,
      removeItem,
      clearCart,
      itemCount: cart.length,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [cart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

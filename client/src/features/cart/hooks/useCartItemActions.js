import { useCallback, useMemo } from "react"
import { toast } from "react-toastify"
import { useCart } from "./useCart"

export const hasStockFor = (product, quantity) => {
  const stock = Number(product.stock)
  return Number.isFinite(stock) && quantity <= stock
}

export const useCartItemActions = () => {
  const { updateQuantity, removeItem } = useCart()

  const remove = useCallback(
    (product) => {
      removeItem(product._id)
      toast.info(`Se eliminó ${product.nombre} del carrito`)
    },
    [removeItem],
  )

  const decrease = useCallback(
    (product) => {
      if (product.quantity <= 1) {
        remove(product)
        return
      }

      updateQuantity(product._id, -1, product.stock)
      toast.info(`Se eliminó 1 ${product.nombre} del carrito`)
    },
    [remove, updateQuantity],
  )

  const increase = useCallback(
    (product) => {
      if (!hasStockFor(product, product.quantity + 1)) {
        toast.error(`No hay más unidades disponibles de ${product.nombre}.`)
        return false
      }

      updateQuantity(product._id, 1, product.stock)
      toast.success(`Se agregó 1 ${product.nombre} al carrito`)
      return true
    },
    [updateQuantity],
  )

  return useMemo(
    () => ({ increase, decrease, remove }),
    [increase, decrease, remove],
  )
}

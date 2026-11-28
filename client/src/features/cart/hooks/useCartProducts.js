import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { productService } from "../../products/services/productService"
import { useCart } from "./useCart"

const UNAVAILABLE_STATUSES = new Set([400, 404])

const unavailableMessage = (count) =>
  count === 1
    ? "Quitamos del carrito un producto que ya no está disponible."
    : `Quitamos del carrito ${count} productos que ya no están disponibles.`

const isUnavailable = (result) =>
  result.status === "fulfilled"
    ? !result.value
    : UNAVAILABLE_STATUSES.has(result.reason?.status)

export const useCartProducts = ({ enabled = true } = {}) => {
  const { cart, removeItem, limitToStock } = useCart()
  const [productsById, setProductsById] = useState({})
  const [failedKey, setFailedKey] = useState(null)
  const knownIdsRef = useRef(new Set())
  const idsKey = [...new Set(cart.map(({ id }) => id))]
    .sort((a, b) => a.localeCompare(b))
    .join("|")

  useEffect(() => {
    if (!enabled || !idsKey) return undefined

    const missingIds = idsKey
      .split("|")
      .filter((id) => !knownIdsRef.current.has(id))

    if (missingIds.length === 0) return undefined

    let isActive = true

    const fetchMissingProducts = async () => {
      const results = await Promise.allSettled(
        missingIds.map((id) => productService.getProductById(id)),
      )

      if (!isActive) return

      const loaded = {}
      const unavailableIds = []
      let failed = false

      results.forEach((result, index) => {
        const id = missingIds[index]

        if (isUnavailable(result)) {
          unavailableIds.push(id)
          return
        }

        if (result.status === "rejected") {
          console.error(result.reason)
          failed = true
          return
        }

        loaded[id] = result.value
        knownIdsRef.current.add(id)
      })

      setProductsById((current) => ({ ...current, ...loaded }))
      Object.values(loaded).forEach((product) => {
        limitToStock(product._id, product.stock)

        if (Number(product.stock) < 1) {
          toast.info(`Quitamos ${product.nombre} del carrito porque se quedó sin stock.`, {
            toastId: `cart-no-stock-${product._id}`,
          })
        }
      })

      if (unavailableIds.length > 0) {
        unavailableIds.forEach((id) => removeItem(id))
        toast.info(unavailableMessage(unavailableIds.length), {
          toastId: "cart-unavailable-products",
        })
      }

      if (failed) {
        setFailedKey(idsKey)
        toast.error("No se pudieron cargar los productos de tu carrito.", {
          toastId: "cart-products-error",
        })
      }
    }

    void fetchMissingProducts()

    return () => {
      isActive = false
    }
  }, [enabled, idsKey, limitToStock, removeItem])

  const rememberProduct = useCallback((product) => {
    if (!product?._id) return
    knownIdsRef.current.add(product._id)
    setProductsById((current) => ({ ...current, [product._id]: product }))
  }, [])

  const products = cart.flatMap(({ id, quantity }) =>
    productsById[id] ? [{ ...productsById[id], quantity }] : [],
  )
  const hasMissingProducts = products.length < cart.length
  const error = hasMissingProducts && failedKey === idsKey

  return {
    products,
    loading: enabled && hasMissingProducts && !error,
    error,
    rememberProduct,
  }
}

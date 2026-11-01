
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { useCart } from "../../features/cart"
import {
  productOptionalFields,
  productService,
} from "../../features/products"
import { productDetailStyles } from "./ProductDetailStyles"

const formatPrice = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export default function ProductDetail() {
  const { id } = useParams()
  const { cart, addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    let isActive = true

    const fetchProduct = async () => {
      setLoading(true)
      setProduct(null)
      setError("")
      setQuantity(1)

      try {
        const data = await productService.getProductById(id)

        if (!isActive) return

        if (!data) {
          throw new Error("El producto no existe")
        }

        setProduct(data)
      } catch (error) {
        console.error(error)

        if (isActive) {
          setProduct(null)
          setError("No se pudo cargar el producto.")
          toast.error("No se pudo cargar el producto.")
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchProduct()

    return () => {
      isActive = false
    }
  }, [id])

  const stock = Number(product?.stock) || 0

  const alreadyInCart = cart.find(
    (item) => item.id === product?._id,
  )?.quantity || 0

  const availableToAdd = Math.max(0, stock - alreadyInCart)

  const selectedQuantity =
    availableToAdd > 0
      ? Math.min(quantity, availableToAdd)
      : 0

  const handleAddToCart = () => {
    if (!product) return

    if (
      !Number.isInteger(selectedQuantity) ||
      selectedQuantity < 1 ||
      selectedQuantity > availableToAdd
    ) {
      toast.error("No hay stock suficiente para esa cantidad.")
      return
    }

    addItem(product, selectedQuantity)
    toast.success(
      `${product.nombre} (×${selectedQuantity}) agregado al carrito`,
    )
    setQuantity(1)
  }

  if (loading) {
    return (
      <section className={productDetailStyles.loadingSection}>
        <p className={productDetailStyles.loadingText}>
          Cargando producto...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className={productDetailStyles.errorSection}>
        <p className={productDetailStyles.errorText}>{error}</p>
      </section>
    )
  }

  if (!product) {
    return null
  }

  return (
    <section className={productDetailStyles.container}>
      <div className={productDetailStyles.grid}>
        <div className={productDetailStyles.imageWrapper}>
          <img
            src={product.imagenUrl}
            alt={product.nombre}
            className={productDetailStyles.image}
          />
        </div>

        <div className={productDetailStyles.contentWrapper}>
          <h1 className={productDetailStyles.title}>
            {product.nombre}
          </h1>

          <p className={productDetailStyles.description}>
            {product.descripcion}
          </p>

          <p className={productDetailStyles.description}>
            <strong>SKU:</strong> {product.sku}
          </p>

          <p className={productDetailStyles.description}>
            <strong>Precio:</strong> {formatPrice.format(Number(product.precio) || 0)}
          </p>

          <p className={productDetailStyles.description}>
            <strong>Stock disponible:</strong> {stock}
          </p>

          {product.medidas && (
            <div className={productDetailStyles.measuresWrapper}>
              <p className={productDetailStyles.measuresText}>
                <strong>Medidas:</strong> {product.medidas}
              </p>
            </div>
          )}

          <div className={productDetailStyles.actionsWrapper}>
            <div className={productDetailStyles.quantitySelector}>
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
                disabled={selectedQuantity <= 1}
                className={productDetailStyles.quantityButton}
                aria-label="Disminuir cantidad"
              >
                −
              </button>

              <span className={productDetailStyles.quantityDisplay}>
                {selectedQuantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((current) =>
                    Math.min(current + 1, availableToAdd),
                  )
                }
                disabled={selectedQuantity >= availableToAdd}
                className={productDetailStyles.quantityButton}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={availableToAdd <= 0}
              className={productDetailStyles.addToCartButton}
            >
              {availableToAdd > 0
                ? "Agregar al carrito"
                : "Sin stock disponible"}
            </button>
          </div>

          {availableToAdd <= 0 && (
            <p className={productDetailStyles.errorText}>
              Ya no hay unidades disponibles para agregar al carrito.
            </p>
          )}

          <div className={productDetailStyles.optionalFieldsWrapper}>
            {productOptionalFields.map(({ key, label }) => {
              const value = product[key]

              if (
                value === undefined ||
                value === null ||
                value === ""
              ) {
                return null
              }

              return (
                <p
                  key={key}
                  className={productDetailStyles.optionalFieldText}
                >
                  <strong>{label}:</strong> {value}
                </p>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { useCart } from "../../features/cart"
import {
  productOptionalFields,
  productService,
} from "../../features/products"
import { productDetailStyles } from "./ProductDetailStyles"

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()

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
        setError("")
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

  const handleAddToCart = () => {
    if (!product) return

    addItem(product, quantity)
    toast.success(`${product.nombre} (×${quantity}) agregado al carrito`)
    setQuantity(1)
  }

  if (loading) {
    return (
      <section className={productDetailStyles.loadingSection}>
        <p className={productDetailStyles.loadingText}>Cargando producto...</p>
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
            src={product.image}
            alt={product.nombre}
            className={productDetailStyles.image}
          />
        </div>

        <div className={productDetailStyles.contentWrapper}>
          <h1 className={productDetailStyles.title}>{product.nombre}</h1>

          <p className={productDetailStyles.description}>
            {product.descripcion}
          </p>

          <div className={productDetailStyles.measuresWrapper}>
            <p className={productDetailStyles.measuresText}>
              <strong>Medidas:</strong> {product.medidas}
            </p>
          </div>

          <div className={productDetailStyles.actionsWrapper}>
            <div className={productDetailStyles.quantitySelector}>
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
                className={productDetailStyles.quantityButton}
                aria-label="Disminuir cantidad"
              >
                −
              </button>

              <span className={productDetailStyles.quantityDisplay}>
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className={productDetailStyles.quantityButton}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className={productDetailStyles.addToCartButton}
            >
              Agregar al carrito
            </button>
          </div>

          <div className={productDetailStyles.optionalFieldsWrapper}>
            {productOptionalFields.map(({ key, label }) => {
              const value = product[key]

              if (!value) {
                return null
              }

              return (
                <p key={key} className={productDetailStyles.optionalFieldText}>
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

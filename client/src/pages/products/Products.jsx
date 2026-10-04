import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { ProductList, productService } from "../../features/products"
import { productsStyles } from "./ProductsStyles"

export default function ProductsPage() {
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getProducts()
        setProducts(data)
      } catch (error) {
        console.error(error)
        setError("No se pudieron cargar los productos.")
        toast.error("No se pudieron cargar los productos.")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (loading) {
    return (
      <section className={productsStyles.loadingSection}>
        <p className={productsStyles.loadingText}>Cargando productos...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className={productsStyles.errorSection}>
        <p className={productsStyles.errorText}>{error}</p>
      </section>
    )
  }

  return (
    <section className={productsStyles.container}>
      <h1 className={productsStyles.title}>Productos</h1>

      <div className={productsStyles.listWrapper}>
        <ProductList products={products} />
      </div>
    </section>
  )
}

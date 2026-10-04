import { useEffect, useState } from "react"
import { ProductList } from "../../features/products/components/ProductList/ProductList"
import { homeStyles } from "./HomeStyles"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/productos")

        if (!response.ok) {
          throw new Error("No se pudieron obtener los productos destacados")
        }

        const products = await response.json()

        const sortedProducts = [...products].sort(
          (a, b) => (b.vendidos ?? 0) - (a.vendidos ?? 0),
        )

        setFeaturedProducts(sortedProducts.slice(0, 4))
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar los productos destacados.")
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <main className={homeStyles.loadingContainer}>
        <p className={homeStyles.loadingText}>Cargando productos destacados...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className={homeStyles.errorContainer}>
        <p className={homeStyles.errorText}>{error}</p>
      </main>
    )
  }

  return (
    <main className={homeStyles.container}>
      <section className={homeStyles.heroSection}>
        <p className={homeStyles.subtitle}>
          Diseños que perduran
        </p>
        <h1 className={homeStyles.title}>
          Hermanos Jota
        </h1>
      </section>

      <section className={homeStyles.productsSection}>
        <div className={homeStyles.sectionHeader}>
          <h2 className={homeStyles.sectionTitle}>
            Productos destacados
          </h2>
        </div>

        <ProductList products={featuredProducts} compact />
      </section>
    </main>
  )
}

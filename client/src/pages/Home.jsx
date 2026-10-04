import { useEffect, useState } from "react"
import { ProductList } from "../components/ProductList/ProductList"

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
      <main className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-[#A0522D]">Cargando productos destacados...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-red-600">{error}</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
      <section className="mb-6 md:mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#A0522D] md:text-sm">
          Diseños que perduran
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#A0522D] md:text-4xl lg:text-5xl">
          Hermanos Jota
        </h1>
      </section>

      <section className="min-h-0">
        <div className="mb-4 md:mb-5">
          <h2 className="font-serif text-2xl font-bold text-[#A0522D] md:text-3xl">
            Productos destacados
          </h2>
        </div>

        <ProductList products={featuredProducts} compact />
      </section>
    </main>
  )
}

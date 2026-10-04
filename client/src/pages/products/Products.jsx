import { useEffect, useState } from "react"
import { ProductList } from "../../features/products/components/ProductList/ProductList"

export default function ProductsPage() {
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/productos")

        if (!response.ok) {
          throw new Error("No se pudieron obtener los productos")
        }

        const data = await response.json()

        setProducts(data)
      } catch (error) {
        console.error(error)
        setError("No se pudieron cargar los productos.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p>Cargando productos...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-red-600">{error}</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-serif text-3xl font-bold text-[#A0522D]">
        Productos
      </h1>

      <div className="mt-8">
        <ProductList products={products} />
      </div>
    </section>
  )
}

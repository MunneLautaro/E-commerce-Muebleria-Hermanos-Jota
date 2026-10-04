import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { ProductList, productService } from "../../features/products"

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

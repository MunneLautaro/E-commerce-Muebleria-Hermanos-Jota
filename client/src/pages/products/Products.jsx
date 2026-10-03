import { useEffect, useState } from "react"
import { ProductList } from "../../components/ProductList/ProductList"

export default function ProductsPage() {
  // Acá vamos a guardar los productos que nos devuelve el backend.
  const [products, setProducts] = useState([])

  // Indica si todavía estamos esperando la respuesta del backend.
  const [loading, setLoading] = useState(true)

  // Guarda un mensaje si ocurre algún error.
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/productos")

        // Si el backend responde con un error, lo detectamos.
        if (!response.ok) {
          throw new Error("No se pudieron obtener los productos")
        }

        // Convertimos la respuesta a JavaScript.
        const data = await response.json()

        // Guardamos los productos.
        setProducts(data)
      } catch (error) {
        console.error(error)
        setError("No se pudieron cargar los productos.")
      } finally {
        // Dejamos de mostrar el estado de carga.
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Mientras esperamos la respuesta.
  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p>Cargando productos...</p>
      </section>
    )
  }

  // Si ocurrió un error.
  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-red-600">{error}</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">

      {/* Título de la página */}
      <h1 className="font-serif text-3xl font-bold text-[#A0522D]">
        Productos
      </h1>

      {/* Catálogo */}
      <div className="mt-8">
        <ProductList products={products} />
      </div>

    </section>
  )
}
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useCart } from "../../context/CartContext"

const optionalFields = [
  { key: "caracteristicas", label: "Características" },
  { key: "materiales", label: "Materiales" },
  { key: "acabado", label: "Acabado" },
  { key: "peso", label: "Peso" },
  { key: "capacidad", label: "Capacidad" },
  { key: "modulares", label: "Modulares" },
  { key: "carga_maxima", label: "Carga máxima" },
  { key: "estructura", label: "Estructura" },
  { key: "tapizado", label: "Tapizado" },
  { key: "confort", label: "Confort" },
  { key: "rotacion", label: "Rotación" },
  { key: "garantia", label: "Garantía" },
  { key: "relleno", label: "Relleno" },
  { key: "sostenibilidad", label: "Sostenibilidad" },
  { key: "extension", label: "Extensión" },
  { key: "apilables", label: "Apilables" },
  { key: "incluye", label: "Incluye" },
  { key: "almacenamiento", label: "Almacenamiento" },
  { key: "cables", label: "Cables" },
  { key: "regulacion", label: "Regulación" },
  { key: "certificacion", label: "Certificación" },
]

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/productos/${id}`,
        )

        if (!response.ok) {
          throw new Error("No se pudo obtener el producto")
        }

        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error(error)
        setError("No se pudo cargar el producto.")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return

    addItem(product, quantity)
    setQuantity(1)
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p>Cargando producto...</p>
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
      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-[#F5E6D3]">
          <img
            src={product.image}
            alt={product.nombre}
            className="h-full min-h-[400px] w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="font-serif text-4xl font-bold text-[#A0522D]">
            {product.nombre}
          </h1>

          <p className="mt-6 text-base leading-7 text-gray-700">
            {product.descripcion}
          </p>

          <div className="mt-6 border-t border-[#A0522D]/20 pt-5">
            <p className="text-base text-gray-700">
              <strong>Medidas:</strong> {product.medidas}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center overflow-hidden rounded-full border border-[#A0522D]/30 bg-[#F5E6D3]">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="flex h-11 w-11 items-center justify-center text-lg font-bold text-siena transition-colors hover:bg-[#EAD9C4]"
                aria-label="Disminuir cantidad"
              >
                −
              </button>

              <span className="min-w-12 text-center text-base font-medium text-ink">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="flex h-11 w-11 items-center justify-center text-lg font-bold text-siena transition-colors hover:bg-[#EAD9C4]"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center rounded-marca bg-[#A0522D] px-6 py-3 text-sm font-medium uppercase tracking-cta text-white transition-colors hover:bg-[#7f4222]"
            >
              Agregar al carrito
            </button>
          </div>

          <div className="mt-5 space-y-3 border-t border-[#A0522D]/20 pt-5">
            {optionalFields.map(({ key, label }) => {
              const value = product[key]

              if (!value) {
                return null
              }

              return (
                <p key={key} className="text-sm leading-6 text-gray-700">
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
import { useRef, useState } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { productService } from "../../features/products"

const initialProduct = {
  sku: "",
  nombre: "",
  descripcion: "",
  medidas: "",
  precio: "",
  stock: "0",
  imagenUrl: "",
  isActive: true,
}

const inputClass =
  "mt-2 w-full rounded-lg border border-[#A0522D]/20 bg-white px-4 py-3 text-sm text-ink shadow-sm transition placeholder:text-ink-soft/60 focus:border-siena focus:outline-none focus:ring-2 focus:ring-siena/15"

const labelClass = "block text-sm font-medium text-ink"

export default function CreateProductPage() {
  const [product, setProduct] = useState(initialProduct)
  const [attributes, setAttributes] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageError, setImageError] = useState(false)
  const nextAttributeId = useRef(0)

  const updateProduct = (event) => {
    const { name, value, checked, type } = event.target
    setProduct((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const addAttribute = () => {
    setAttributes((current) => [
      ...current,
      { id: nextAttributeId.current++, clave: "", valor: "" },
    ])
  }

  const updateAttribute = (id, field, value) => {
    setAttributes((current) =>
      current.map((attribute) =>
        attribute.id === id ? { ...attribute, [field]: value } : attribute,
      ),
    )
  }

  const removeAttribute = (id) => {
    setAttributes((current) =>
      current.filter((attribute) => attribute.id !== id),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const form = event.currentTarget
    const payload = {
      ...product,
      precio: Number(product.precio),
      stock: Number(product.stock),
      atributos: attributes.map(({ clave, valor }) => ({
        clave: clave.trim(),
        valor: valor.trim(),
      })),
    }

    setIsSubmitting(true)

    try {
      await productService.createProduct(payload)
      toast.success("Producto creado correctamente.")
      setProduct(initialProduct)
      setAttributes([])
      setImageError(false)
      form.reset()
    } catch (error) {
      toast.error(error.message || "No se pudo crear el producto.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <Link
        to="/productos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-siena transition hover:text-ink"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Volver al catálogo
      </Link>

      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
          Panel de administración
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Crear producto</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Completá la información del producto. Podés sumar todos los atributos
          personalizados que necesites.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section
          aria-labelledby="product-data-title"
          className="rounded-2xl border border-[#A0522D]/15 bg-white/90 p-5 shadow-marca sm:p-8"
        >
          <div className="mb-6 border-b border-linea pb-4">
            <h2 id="product-data-title" className="text-xl">
              Datos del producto
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Los campos marcados con * son obligatorios.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              SKU *
              <input
                className={inputClass}
                name="sku"
                value={product.sku}
                onChange={updateProduct}
                placeholder="Ej. HJ-012"
                autoComplete="off"
                maxLength={40}
                required
              />
            </label>

            <label className={labelClass}>
              Nombre *
              <input
                className={inputClass}
                name="nombre"
                value={product.nombre}
                onChange={updateProduct}
                placeholder="Ej. Sillón Nórdico"
                maxLength={120}
                required
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Descripción
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                name="descripcion"
                value={product.descripcion}
                onChange={updateProduct}
                placeholder="Describí el producto, sus materiales y beneficios."
                rows={4}
                maxLength={2000}
              />
            </label>

            <label className={labelClass}>
              Medidas
              <input
                className={inputClass}
                name="medidas"
                value={product.medidas}
                onChange={updateProduct}
                placeholder="Ej. 180 × 45 × 75 cm"
                maxLength={120}
              />
            </label>

            <label className={labelClass}>
              Precio (ARS) *
              <input
                className={inputClass}
                name="precio"
                type="number"
                value={product.precio}
                onChange={updateProduct}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </label>

            <label className={labelClass}>
              Stock disponible *
              <input
                className={inputClass}
                name="stock"
                type="number"
                value={product.stock}
                onChange={updateProduct}
                min="0"
                step="1"
                required
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              URL de la imagen
              <input
                className={inputClass}
                name="imagenUrl"
                type="text"
                value={product.imagenUrl}
                onChange={(event) => {
                  updateProduct(event)
                  setImageError(false)
                }}
                placeholder="/images/kit de imágenes/Producto.png"
              />
              <span className="mt-2 block text-xs font-normal text-ink-soft">
                Pegá una URL pública o una ruta de imagen dentro del sitio.
              </span>
            </label>

            {product.imagenUrl && !imageError && (
              <div className="sm:col-span-2">
                <img
                  src={product.imagenUrl}
                  alt={`Vista previa de ${product.nombre || "el producto"}`}
                  onError={() => setImageError(true)}
                  className="h-52 w-full rounded-lg border border-linea bg-[#F5E6D3] object-contain p-3"
                />
              </div>
            )}

            {product.imagenUrl && imageError && (
              <p className="text-sm text-error sm:col-span-2" role="status">
                No se pudo cargar la vista previa de esta URL.
              </p>
            )}

            <label className="flex items-center gap-3 rounded-lg bg-crema px-4 py-3 text-sm text-ink sm:col-span-2">
              <input
                className="h-4 w-4 accent-siena"
                name="isActive"
                type="checkbox"
                checked={product.isActive}
                onChange={updateProduct}
              />
              Producto activo y visible en el catálogo
            </label>
          </div>
        </section>

        <section
          aria-labelledby="product-attributes-title"
          className="rounded-2xl border border-[#A0522D]/15 bg-white/90 p-5 shadow-marca sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-linea pb-4">
            <div>
              <h2 id="product-attributes-title" className="text-xl">
                Atributos adicionales
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Agregá campos propios, por ejemplo material, acabado o garantía.
              </p>
            </div>
            <button
              type="button"
              onClick={addAttribute}
              className="inline-flex items-center gap-2 rounded-lg border border-siena/30 px-4 py-2 text-xs font-semibold text-siena transition hover:bg-crema"
            >
              <Plus size={16} aria-hidden="true" />
              Agregar campo
            </button>
          </div>

          {attributes.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-[#A0522D]/25 bg-crema/60 px-4 py-8 text-center">
              <Plus
                className="mx-auto mb-2 text-salvia"
                size={24}
                aria-hidden="true"
              />
              <p className="text-sm text-ink-soft">
                Todavía no agregaste campos personalizados.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {attributes.map((attribute, index) => (
                <div
                  key={attribute.id}
                  className="grid gap-3 rounded-xl border border-linea bg-crema/50 p-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end"
                >
                  <label className={labelClass}>
                    Nombre del campo
                    <input
                      className={inputClass}
                      value={attribute.clave}
                      onChange={(event) =>
                        updateAttribute(
                          attribute.id,
                          "clave",
                          event.target.value,
                        )
                      }
                      placeholder="Ej. Material"
                      maxLength={60}
                      aria-label={`Nombre del campo ${index + 1}`}
                      required
                    />
                  </label>
                  <label className={labelClass}>
                    Valor
                    <input
                      className={inputClass}
                      value={attribute.valor}
                      onChange={(event) =>
                        updateAttribute(
                          attribute.id,
                          "valor",
                          event.target.value,
                        )
                      }
                      placeholder="Ej. Madera de nogal"
                      maxLength={250}
                      aria-label={`Valor del campo ${index + 1}`}
                      required
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeAttribute(attribute.id)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm text-error transition hover:bg-error-bg"
                    aria-label={`Eliminar campo ${index + 1}`}
                  >
                    <Trash2 size={17} aria-hidden="true" />
                    <span className="sm:hidden">Eliminar campo</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link
            to="/productos"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-siena/30 px-6 text-sm font-semibold text-siena transition hover:bg-crema"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-siena px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7f4222] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Guardando..." : "Guardar producto"}
          </button>
        </div>
      </form>
    </section>
  )
}

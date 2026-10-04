import { Link } from "react-router-dom"

// Lista de todos los campos opcionales que puede tener un producto.
// El nombre de la izquierda es el nombre que usamos en el objeto.
// El nombre de la derecha es el que verá el usuario.
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

const hoverStyles = `
  .product-card-link {
    --color-primary: #a0522d;
    display: block;
    text-decoration: none;
    cursor: pointer;
  }

  .product-card {
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      outline 180ms ease;
  }

  .product-card-link:hover .product-card,
  .product-card-link:focus-visible .product-card {
    transform: translateY(-0.35rem);
    border-color: var(--color-primary);
    box-shadow: 0 0.75rem 1.5rem color-mix(in srgb, var(--color-primary) 12%, transparent);
    outline: none;
  }
`

// ProductCard representa un único producto del catálogo.
// Recibe un objeto "product".
export const ProductCard = ({ product, compact = false }) => {
  return (
    <>
      <style>{hoverStyles}</style>

      <Link
        to={`/productos/${product.id}`}
        className="product-card-link h-full"
        aria-label={`Ver detalle del producto ${product.nombre}`}
      >
        <article className="product-card h-full overflow-hidden rounded-lg border border-[#A0522D]/20 bg-[#F5E6D3] shadow-md">
          {/* Imagen del producto */}
          <img
            src={product.image}
            alt={product.nombre}
            className={compact ? "h-64 w-full object-cover sm:h-52" : "h-64 w-full object-cover"}
          />

          <div className={compact ? "px-3 pb-3 pt-2" : "p-5"}>
            {/* Nombre: todos los productos lo tienen */}
            <h2
              className={
                compact
                  ? "font-serif text-lg font-bold text-[#A0522D] sm:text-xl"
                  : "font-serif text-2xl font-bold text-[#A0522D]"
              }
            >
              {product.nombre}
            </h2>

            {!compact && (
              <>
                {/* Descripción: todos los productos la tienen */}
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  {product.descripcion}
                </p>

                {/* Medidas: todos los productos las tienen */}
                <p className="mt-4 text-sm text-gray-700">
                  <strong>Medidas:</strong> {product.medidas}
                </p>

                {/*
                  Campos opcionales.
                  Recorremos la lista de campos posibles.
                  Si el producto tiene ese campo, lo mostramos.
                  Si no lo tiene, no aparece nada.
                */}
                <div className="mt-5 space-y-2 border-t border-[#A0522D]/20 pt-4">
                  {optionalFields.map(({ key, label }) => {
                    const value = product[key]

                    // Si el producto no tiene este dato, no mostramos nada.
                    if (!value) {
                      return null
                    }

                    return (
                      <p
                        key={key}
                        className="text-sm leading-5 text-gray-700"
                      >
                        <strong>{label}:</strong> {value}
                      </p>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </article>
      </Link>
    </>
  )
}
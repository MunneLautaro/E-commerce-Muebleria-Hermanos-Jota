import { Link } from "react-router-dom"
import { productCardStyles } from "./ProductCardStyles"

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

export const ProductCard = ({ product, compact = false }) => {
  return (
    <Link
      to={`/productos/${product.id}`}
      className={productCardStyles.link}
      aria-label={`Ver detalle del producto ${product.nombre}`}
    >
      <article className={productCardStyles.card}>
        <img
          src={product.image}
          alt={product.nombre}
          className={productCardStyles.image(compact)}
        />

        <div className={productCardStyles.content(compact)}>
          <h2 className={productCardStyles.title(compact)}>{product.nombre}</h2>

          {!compact && (
            <>
              <p className={productCardStyles.description}>
                {product.descripcion}
              </p>

              <p className={productCardStyles.measures}>
                <strong>Medidas:</strong> {product.medidas}
              </p>

              <div className={productCardStyles.optionalFields}>
                {optionalFields.map(({ key, label }) => {
                  const value = product[key]

                  if (!value) {
                    return null
                  }

                  return (
                    <p
                      key={key}
                      className={productCardStyles.optionalField}
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
  )
}

import { Star } from "lucide-react"
import { Link } from "react-router-dom"
import { productOptionalFields } from "../../constants/productFields"
import { productCardStyles } from "./ProductCardStyles"

const formatPrice = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const getBadge = (product) => {
  if (typeof product.stock === "number" && product.stock <= 0) {
    return { label: "Agotado", ariaLabel: "sin stock", variant: "soldOut" }
  }

  if (product.masVendido) {
    return {
      label: "Lo más elegido",
      ariaLabel: "uno de los más vendidos",
      variant: "bestSeller",
    }
  }

  return null
}

export const ProductCard = ({ product, compact = false }) => {
  const price = Number(product.precio)
  const badge = compact ? null : getBadge(product)
  const soldOut = badge?.variant === "soldOut"

  return (
    <Link
      to={`/productos/${product._id}`}
      className={productCardStyles.link}
      aria-label={`Ver detalle del producto ${product.nombre}${
        badge ? `, ${badge.ariaLabel}` : ""
      }`}
    >
      <article className={productCardStyles.card}>
        <div className={productCardStyles.media}>
          <img
            src={product.imagenUrl}
            alt={product.nombre}
            width={800}
            height={800}
            loading="lazy"
            decoding="async"
            className={productCardStyles.image(compact, soldOut)}
          />
          {badge && (
            <span className={productCardStyles.badge(badge.variant)}>
              {badge.variant === "bestSeller" && (
                <Star
                  size={12}
                  fill="currentColor"
                  strokeWidth={0}
                  aria-hidden="true"
                />
              )}
              {badge.label}
            </span>
          )}
        </div>

        <div className={productCardStyles.content(compact)}>
          <h2 className={productCardStyles.title(compact)}>{product.nombre}</h2>

          {!compact && (
            <>
              {product.precio !== null &&
                product.precio !== undefined &&
                product.precio !== "" &&
                Number.isFinite(price) && (
                  <p className={productCardStyles.price}>
                    {formatPrice.format(price)}
                  </p>
                )}

              <p className={productCardStyles.description}>
                {product.descripcion}
              </p>

              {product.medidas && (
                <p className={productCardStyles.measures}>
                  <strong>Medidas:</strong> {product.medidas}
                </p>
              )}

              <div className={productCardStyles.optionalFields}>
                {productOptionalFields.map(({ key, label }) => {
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
                {product.atributos?.map(({ clave, valor }, index) => (
                  <p
                    key={`${clave}-${index}`}
                    className={productCardStyles.optionalField}
                  >
                    <strong>{clave}:</strong> {valor}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </article>
    </Link>
  )
}

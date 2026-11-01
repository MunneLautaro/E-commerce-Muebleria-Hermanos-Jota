import { Link } from "react-router-dom"
import { productOptionalFields } from "../../constants/productFields"
import { productCardStyles } from "./ProductCardStyles"

const formatPrice = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export const ProductCard = ({ product, compact = false }) => {
  const price = Number(product.precio)

  return (
    <Link
      to={`/productos/${product._id}`}
      className={productCardStyles.link}
      aria-label={`Ver detalle del producto ${product.nombre}`}
    >
      <article className={productCardStyles.card}>
        <img
          src={product.imagenUrl}
          alt={product.nombre}
          className={productCardStyles.image(compact)}
        />

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

              <p className={productCardStyles.measures}>
                <strong>Medidas:</strong> {product.medidas}
              </p>

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
              </div>
            </>
          )}
        </div>
      </article>
    </Link>
  )
}

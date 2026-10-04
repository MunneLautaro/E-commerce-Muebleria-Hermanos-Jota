import { Link } from "react-router-dom"
import { productOptionalFields } from "../../constants/productFields"
import { productCardStyles } from "./ProductCardStyles"

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

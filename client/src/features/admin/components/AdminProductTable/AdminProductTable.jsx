import { Pencil, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { adminProductTableStyles as styles } from "./AdminProductTableStyles"

const formatPrice = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export function AdminProductTable({ products, onDelete }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr>
            <th scope="col" className={styles.firstHeadCell}>
              Producto
            </th>
            <th scope="col" className={styles.headCell}>
              Precio
            </th>
            <th scope="col" className={styles.headCell}>
              Stock
            </th>
            <th scope="col" className={styles.actionHeadCell}>
              Acción
            </th>
          </tr>
        </thead>
        <tbody className={styles.body}>
          {products.map((product) => (
            <tr key={product._id} className={styles.row}>
              <td className={styles.productCell}>
                <div className={styles.productInfo}>
                  <img src={product.imagenUrl} alt="" className={styles.image} />
                  <div>
                    <p className={styles.name}>{product.nombre}</p>
                    <p className={styles.sku}>{product.sku}</p>
                  </div>
                </div>
              </td>
              <td className={styles.priceCell}>
                {formatPrice.format(Number(product.precio) || 0)}
              </td>
              <td className={styles.statusCell}>
                <span
                  className={
                    product.isActive
                      ? styles.activeStatus
                      : styles.inactiveStatus
                  }
                >
                  {product.isActive ? product.stock : "Inactivo"}
                </span>
              </td>
              <td className={styles.actionCell}>
                <Link
                  to={`/admin/editar-producto/${product._id}`}
                  className={styles.editButton}
                >
                  <Pencil size={15} aria-hidden="true" />
                  Editar
                </Link>
                {product.isActive && (
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className={styles.deleteButton}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

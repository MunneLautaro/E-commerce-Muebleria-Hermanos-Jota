import { Eye } from "lucide-react"
import {
  OrderStatusBadge,
  formatOrderDate,
  formatOrderUnits,
} from "../../../orders"
import { formatPrice } from "../../../../utils/formatPrice"
import { adminOrderTableStyles as styles } from "./AdminOrderTableStyles"

export function AdminOrderTable({ orders, onShowDetail }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr>
            <th scope="col" className={styles.firstHeadCell}>
              Orden
            </th>
            <th scope="col" className={styles.headCell}>
              Fecha
            </th>
            <th scope="col" className={styles.headCell}>
              Comprador
            </th>
            <th scope="col" className={styles.headCell}>
              Productos
            </th>
            <th scope="col" className={styles.headCell}>
              Total
            </th>
            <th scope="col" className={styles.headCell}>
              Estado
            </th>
            <th scope="col" className={styles.actionHeadCell}>
              Detalle
            </th>
          </tr>
        </thead>
        <tbody className={styles.body}>
          {orders.map((order) => (
            <tr key={order._id} className={styles.row}>
              <td className={styles.orderCell}>{order._id}</td>
              <td className={styles.cell}>{formatOrderDate(order.createdAt)}</td>
              <td className={styles.cell}>
                <p className={styles.buyerName}>
                  {order.comprador?.name || "Sin nombre"}
                </p>
                <p className={styles.buyerEmail}>
                  {order.comprador?.email ?? "Usuario no disponible"}
                </p>
              </td>
              <td className={styles.cell}>{formatOrderUnits(order)}</td>
              <td className={styles.totalCell}>{formatPrice(order.total)}</td>
              <td className={styles.cell}>
                <OrderStatusBadge estado={order.estado} />
              </td>
              <td className={styles.actionCell}>
                <button
                  type="button"
                  onClick={() => onShowDetail(order)}
                  className={styles.detailButton}
                  aria-label={`Ver detalle de la orden ${order._id}`}
                >
                  <Eye size={15} aria-hidden="true" />
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

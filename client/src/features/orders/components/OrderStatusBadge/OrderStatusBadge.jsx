import { getOrderStatus } from "../../constants/orderStatus"
import { orderStatusBadgeStyles as styles } from "./OrderStatusBadgeStyles"

export function OrderStatusBadge({ estado }) {
  const status = getOrderStatus(estado)

  return (
    <span className={`${styles.base} ${status.badgeClassName}`}>
      {status.label}
    </span>
  )
}

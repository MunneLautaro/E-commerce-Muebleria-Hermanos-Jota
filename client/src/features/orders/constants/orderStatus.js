import { orderStatusBadgeStyles as badge } from "../components/OrderStatusBadge/OrderStatusBadgeStyles"

export const ORDER_STATUSES = [
  { value: "pendiente", label: "Pago pendiente", badgeClassName: badge.pendiente },
  { value: "aceptada", label: "Pago confirmado", badgeClassName: badge.aceptada },
  { value: "rechazada", label: "Pago rechazado", badgeClassName: badge.rechazada },
]

export const ORDER_STATUS_VALUES = ORDER_STATUSES.map(({ value }) => value)

const UNKNOWN_STATUS = { label: "Estado desconocido", badgeClassName: badge.desconocido }

export const getOrderStatus = (value) =>
  ORDER_STATUSES.find((status) => status.value === value) ?? {
    value,
    ...UNKNOWN_STATUS,
  }

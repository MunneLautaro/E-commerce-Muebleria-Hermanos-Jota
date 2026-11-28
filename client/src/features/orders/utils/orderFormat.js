const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires"

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: ARGENTINA_TIME_ZONE,
})

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: ARGENTINA_TIME_ZONE,
})

const formatWith = (formatter, value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : formatter.format(date)
}

export const formatOrderDate = (value) => formatWith(dateFormatter, value)

export const formatOrderDateTime = (value) => formatWith(dateTimeFormatter, value)

export const countOrderUnits = (order) =>
  (order.productos ?? []).reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0)

export const formatOrderUnits = (order) => {
  const units = countOrderUnits(order)
  return `${units} ${units === 1 ? "producto" : "productos"}`
}

export const getUnitPrice = ({ subtotal, cantidad }) =>
  Number(cantidad) > 0 ? Number(subtotal) / Number(cantidad) : 0

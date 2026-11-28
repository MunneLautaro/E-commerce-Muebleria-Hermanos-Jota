import * as yup from "yup"
import { PURCHASE_ORDER_STATES } from "../models/purchaseOrder.model.js"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const isCalendarDate = (value) => {
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

const dateParam = (label) =>
  yup
    .string()
    .trim()
    .matches(DATE_PATTERN, {
      message: `${label} debe tener el formato AAAA-MM-DD`,
      excludeEmptyString: true,
    })
    .test(
      "calendar-date",
      `${label} no es una fecha válida`,
      (value) => !value || !DATE_PATTERN.test(value) || isCalendarDate(value),
    )

export const purchaseOrderQuerySchema = yup.object({
  page: yup
    .number()
    .typeError("page debe ser numérico")
    .integer("page debe ser un entero")
    .min(1, "page debe ser mayor o igual a 1")
    .max(10000, "page no puede superar 10000")
    .default(1),
  limit: yup
    .number()
    .typeError("limit debe ser numérico")
    .integer("limit debe ser un entero")
    .oneOf([12, 15, 20], "limit debe ser 12, 15 o 20")
    .default(12),
})

export const adminPurchaseOrderQuerySchema = purchaseOrderQuerySchema
  .shape({
    estado: yup
      .string()
      .oneOf(
        PURCHASE_ORDER_STATES,
        `estado debe ser ${PURCHASE_ORDER_STATES.join(", ")}`,
      ),
    desde: dateParam("desde"),
    hasta: dateParam("hasta"),
    q: yup.string().trim().max(100, "q no puede superar 100 caracteres"),
  })
  .test(
    "valid-date-range",
    "desde no puede ser posterior a hasta",
    (value) => !value?.desde || !value?.hasta || value.desde <= value.hasta,
  )

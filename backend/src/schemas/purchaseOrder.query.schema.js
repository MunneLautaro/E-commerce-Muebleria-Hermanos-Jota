import * as yup from "yup"

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

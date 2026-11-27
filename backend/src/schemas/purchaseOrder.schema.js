import * as yup from "yup"
import mongoose from "mongoose"

export const MAX_ORDER_ITEMS = 50

const orderItemSchema = yup.object({
  producto: yup
    .string()
    .trim()
    .required("Indicá el producto")
    .test(
      "object-id",
      "El ID del producto no es válido",
      (value) => value === undefined || mongoose.isValidObjectId(value),
    ),
  cantidad: yup
    .number()
    .typeError("La cantidad debe ser numérica")
    .integer("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser al menos 1")
    .required("Indicá la cantidad"),
})

export const createPurchaseOrderSchema = yup.object({
  productos: yup
    .array()
    .of(orderItemSchema)
    .typeError("Los productos deben enviarse en una lista")
    .min(1, "La compra debe contener al menos un producto")
    .max(
      MAX_ORDER_ITEMS,
      `La compra no puede tener más de ${MAX_ORDER_ITEMS} productos`,
    )
    .required("La compra debe contener al menos un producto"),
})

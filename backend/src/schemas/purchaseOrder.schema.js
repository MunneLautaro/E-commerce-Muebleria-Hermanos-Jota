import * as yup from "yup"
import mongoose from "mongoose"
import {
  POSTAL_CODE_PATTERN,
  PHONE_PATTERN,
  SHIPPING_LIMITS,
} from "../models/purchaseOrder.model.js"

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

const requiredText = (requiredMessage, max, label) =>
  yup
    .string()
    .trim()
    .max(max, `${label} no puede superar los ${max} caracteres`)
    .required(requiredMessage)

const shippingSchema = yup
  .object({
    nombreCompleto: requiredText(
      "Ingresá el nombre completo de quien recibe",
      SHIPPING_LIMITS.nombreCompleto,
      "El nombre completo",
    ),
    telefono: requiredText(
      "Ingresá un teléfono de contacto",
      SHIPPING_LIMITS.telefono,
      "El teléfono",
    ).matches(PHONE_PATTERN, {
      message: "Ingresá un teléfono válido",
      excludeEmptyString: true,
    }),
    direccion: requiredText(
      "Ingresá la dirección de entrega",
      SHIPPING_LIMITS.direccion,
      "La dirección",
    ),
    altura: requiredText(
      "Ingresá la altura de la dirección",
      SHIPPING_LIMITS.altura,
      "La altura",
    ),
    ciudad: requiredText("Ingresá la ciudad", SHIPPING_LIMITS.ciudad, "La ciudad"),
    codigoPostal: requiredText(
      "Ingresá el código postal",
      SHIPPING_LIMITS.codigoPostal,
      "El código postal",
    ).matches(POSTAL_CODE_PATTERN, {
      message: "Ingresá un código postal válido",
      excludeEmptyString: true,
    }),
  })
  .default(undefined)
  .typeError("Los datos de envío no son válidos")
  .required("Indicá los datos de envío")

export const createPurchaseOrderSchema = yup.object({
  envio: shippingSchema,
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

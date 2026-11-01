import * as yup from "yup"

const productFields = {
  sku: yup
    .string()
    .trim()
    .uppercase()
    .min(1, "El SKU no puede estar vacío")
    .max(50, "El SKU no puede superar los 50 caracteres"),
  nombre: yup
    .string()
    .trim()
    .min(1, "El nombre no puede estar vacío")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  descripcion: yup
    .string()
    .trim()
    .max(2000, "La descripción no puede superar los 2000 caracteres"),
  precio: yup
    .number()
    .typeError("El precio debe ser un número")
    .min(0, "El precio no puede ser negativo"),
  stock: yup
    .number()
    .typeError("El stock debe ser un número")
    .integer("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),
  imagenUrl: yup
    .string()
    .trim()
    .max(2048, "La URL de imagen no puede superar los 2048 caracteres"),
}

export const createProductSchema = yup.object({
  sku: productFields.sku.required("El SKU es obligatorio"),
  nombre: productFields.nombre.required("El nombre es obligatorio"),
  descripcion: productFields.descripcion,
  precio: productFields.precio.required("El precio es obligatorio"),
  stock: productFields.stock,
  imagenUrl: productFields.imagenUrl,
})

export const updateProductSchema = yup
  .object(productFields)
  .test(
    "at-least-one-field",
    "Debe proporcionar al menos un campo para actualizar",
    (value) => Object.values(value ?? {}).some((field) => field !== undefined),
  )

export const productIdSchema = yup.object({
  id: yup
    .string()
    .matches(/^[a-f\d]{24}$/i, "El id del producto no es válido")
    .required("El id del producto es obligatorio"),
})

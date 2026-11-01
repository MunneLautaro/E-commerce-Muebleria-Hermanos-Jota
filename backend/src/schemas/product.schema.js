import * as yup from "yup"

export const updateProductSchema = yup.object({
  sku: yup.string().trim().uppercase(),
  nombre: yup.string().trim(),
  descripcion: yup.string().trim(),
  precio: yup
    .number()
    .typeError("El precio debe ser un número")
    .min(0, "El precio no puede ser negativo"),
  stock: yup
    .number()
    .typeError("El stock debe ser un número")
    .min(0, "El stock no puede ser negativo"),
  imagenUrl: yup.string().trim(),
  isActive: yup.boolean(),
}).test(
  "at-least-one-field",
  "Debe enviar al menos un campo para actualizar",
  (value) => Object.keys(value || {}).length > 0,
)

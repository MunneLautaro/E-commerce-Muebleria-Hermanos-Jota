import * as yup from "yup"

const generatedId = yup
  .mixed()
  .test(
    "server-generated-id",
    "El ID del producto se genera automáticamente y no debe enviarse",
    (value) => value === undefined,
  )

const price = yup
  .number()
  .transform((value, originalValue) => {
    if (typeof originalValue !== "string") {
      return value
    }

    const normalizedValue = originalValue.trim()
    return /^\d+(?:\.\d+)?$/.test(normalizedValue)
      ? Number(normalizedValue)
      : Number.NaN
  })
  .typeError("El precio debe ser numérico y no debe contener caracteres no numéricos")
  .min(0, "El precio no puede ser negativo")
  .required("El precio es obligatorio")

export const createProductSchema = yup.object({
  id: generatedId,
  _id: generatedId,
  sku: yup.string().trim().uppercase().required("El SKU es obligatorio"),
  nombre: yup.string().trim().required("El nombre es obligatorio"),
  descripcion: yup.string().trim(),
  medidas: yup.string().trim(),
  precio: price,
  stock: yup
    .number()
    .typeError("El stock debe ser numérico")
    .min(0, "El stock no puede ser negativo"),
  imagenUrl: yup.string().trim(),
  atributos: yup
    .array()
    .of(
      yup.object({
        clave: yup.string().trim().required("El nombre del atributo es obligatorio"),
        valor: yup.string().trim().required("El valor del atributo es obligatorio"),
      }),
    )
    .default([]),
  isActive: yup.boolean().typeError("isActive debe ser booleano"),
})
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

import * as yup from "yup"

const generatedId = yup
  .mixed()
  .test(
    "server-generated-id",
    "El ID del producto se genera automáticamente y no debe enviarse",
    (value) => value === undefined,
  )

const generatedSku = yup
  .mixed()
  .test(
    "server-generated-sku",
    "El SKU se genera automáticamente y no debe enviarse",
    (value) => value === undefined,
  )

const normalizePrice = (value) => {
  const normalizedValue = value.trim().replace(/\s/g, "")

  if (/^\d+(?:\.\d{1,2})?$/.test(normalizedValue)) {
    return Number(normalizedValue)
  }

  if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(normalizedValue)) {
    return Number(normalizedValue.replace(/\./g, "").replace(",", "."))
  }

  if (/^\d+(?:,\d{1,2})?$/.test(normalizedValue)) {
    return Number(normalizedValue.replace(",", "."))
  }

  return Number.NaN
}

const price = yup
  .number()
  .transform((value, originalValue) => {
    if (typeof originalValue !== "string") {
      return value
    }

    return normalizePrice(originalValue)
  })
  .typeError(
    "El precio debe ser numérico. Usá puntos para miles y coma para centavos",
  )
  .min(0, "El precio no puede ser negativo")
  .max(1_000_000_000, "El precio supera el máximo permitido")
  .test(
    "finite",
    "El precio debe ser finito",
    (value) => value === undefined || Number.isFinite(value),
  )
  .required("El precio es obligatorio")

const stock = yup
  .number()
  .transform((value, originalValue) => {
    if (typeof originalValue !== "string") {
      return value
    }

    const normalizedValue = originalValue.trim()
    return /^\d+$/.test(normalizedValue)
      ? Number(normalizedValue)
      : Number.NaN
  })
  .typeError("El stock debe ser un entero no negativo")
  .integer("El stock debe ser un entero")
  .min(0, "El stock no puede ser negativo")
  .max(100_000, "El stock supera el máximo permitido")
  .test(
    "finite",
    "El stock debe ser finito",
    (value) => value === undefined || Number.isFinite(value),
  )

const attributes = yup
  .array()
  .max(30, "No se pueden enviar más de 30 atributos")
  .of(
    yup.object({
      clave: yup
        .string()
        .trim()
        .min(1, "El nombre del atributo es obligatorio")
        .max(80, "El nombre del atributo no puede superar los 80 caracteres")
        .required("El nombre del atributo es obligatorio"),
      valor: yup
        .string()
        .trim()
        .min(1, "El valor del atributo es obligatorio")
        .max(200, "El valor del atributo no puede superar los 200 caracteres")
        .required("El valor del atributo es obligatorio"),
    }),
  )

const imageUrl = yup
  .string()
  .trim()
  .max(2048, "La URL de imagen no puede superar 2048 caracteres")
  .test(
    "image-url",
    "La imagen debe ser una URL HTTP/HTTPS o una ruta relativa válida",
    (value) => {
      if (!value) return false
      if (value.startsWith("/")) return true

      try {
        const url = new URL(value)
        return url.protocol === "http:" || url.protocol === "https:"
      } catch {
        return false
      }
    },
  )

export const createProductSchema = yup.object({
  id: generatedId,
  _id: generatedId,
  sku: generatedSku,
  nombre: yup.string().trim().required("El nombre es obligatorio"),
  descripcion: yup.string().trim(),
  medidas: yup.string().trim(),
  precio: price,
  stock,
  imagenUrl: imageUrl.required("La imagen es obligatoria"),
  atributos: attributes.default([]),
  isActive: yup.boolean().typeError("isActive debe ser booleano"),
})
export const updateProductSchema = yup.object({
  sku: yup.string().trim().uppercase(),
  nombre: yup.string().trim(),
  descripcion: yup.string().trim(),
  medidas: yup.string().trim(),
  precio: price.notRequired(),
  stock,
  imagenUrl: imageUrl.notRequired(),
  atributos: attributes,
  isActive: yup.boolean(),
}).test(
  "at-least-one-field",
  "Debe enviar al menos un campo para actualizar",
  (value) => Object.keys(value || {}).length > 0,
)

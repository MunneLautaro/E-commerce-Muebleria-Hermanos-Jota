import * as yup from "yup"

const price = yup
  .number()
  .transform((value, originalValue) => {
    if (typeof originalValue !== "string") return value

    const normalized = originalValue.trim().replace(/\s/g, "")
    if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(normalized)) {
      return Number(normalized.replace(/\./g, "").replace(",", "."))
    }

    if (/^\d+(?:[.,]\d{1,2})?$/.test(normalized)) {
      return Number(normalized.replace(",", "."))
    }

    return Number.NaN
  })
  .typeError(
    "El precio debe ser numérico. Usá puntos para miles y coma para centavos",
  )
  .min(0, "El precio no puede ser negativo")
  .max(1_000_000_000, "El precio supera el máximo permitido")
  .required("El precio es obligatorio")

export const productFormSchema = yup.object({
  nombre: yup.string().trim().required("El nombre es obligatorio"),
  descripcion: yup.string().trim(),
  medidas: yup.string().trim(),
  precio: price,
  stock: yup
    .number()
    .typeError("El stock debe ser un entero no negativo")
    .integer("El stock debe ser un entero")
    .min(0, "El stock no puede ser negativo")
    .max(100_000, "El stock supera el máximo permitido")
    .required("El stock es obligatorio"),
  imagenUrl: yup
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
    .required("La imagen es obligatoria"),
  isActive: yup.boolean().required(),
  atributos: yup
    .array()
    .max(30, "No se pueden agregar más de 30 atributos")
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
    ),
})

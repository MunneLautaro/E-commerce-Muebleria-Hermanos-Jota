import * as yup from "yup"

const finiteNonNegativeNumber = (label) =>
  yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === "string" && originalValue.trim() === "") {
        return Number.NaN
      }

      return value
    })
    .typeError(`${label} debe ser numérico`)
    .test(
      "finite",
      `${label} debe ser finito`,
      (value) => value === undefined || Number.isFinite(value),
    )
    .min(0, `${label} no puede ser negativo`)
    .notRequired()

export const productQuerySchema = yup.object({
  page: yup
    .number()
    .integer("page debe ser un entero")
    .min(1, "page debe ser mayor o igual a 1")
    .max(10000, "page no puede superar 10000")
    .default(1),
  limit: yup
    .number()
    .integer("limit debe ser un entero")
    .oneOf([12, 15, 20], "limit debe ser 12, 15 o 20")
    .default(12),
  order: yup
    .string()
    .oneOf(["name_asc"], "order no es válido")
    .default("name_asc"),
  q: yup.string().trim().max(100, "q no puede superar 100 caracteres"),
  minPrice: finiteNonNegativeNumber("minPrice"),
  maxPrice: finiteNonNegativeNumber("maxPrice"),
}).test(
  "valid-price-range",
  "minPrice no puede superar maxPrice",
  (value) =>
    value?.minPrice === undefined ||
    value?.maxPrice === undefined ||
    value.minPrice <= value.maxPrice,
)

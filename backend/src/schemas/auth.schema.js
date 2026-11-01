import * as yup from "yup"

const email = yup
  .string()
  .trim()
  .lowercase()
  .email("El email no es válido")
  .required("El email es obligatorio")

const password = yup
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .test(
    "not-whitespace-only",
    "La contraseña no puede estar compuesta solo por espacios",
    (value) => value === undefined || value.trim().length > 0,
  )
  .required("La contraseña es obligatoria")

export const registerSchema = yup.object({
  email,
  password,
  phone: yup
    .string()
    .trim()
    .min(7, "El teléfono debe tener al menos 7 caracteres")
    .max(30, "El teléfono no puede superar los 30 caracteres")
    .matches(
      /^[0-9+()\-\s]+$/,
      "El teléfono contiene caracteres no válidos",
    )
    .required("El teléfono es obligatorio"),
  address: yup
    .string()
    .trim()
    .min(3, "La dirección debe tener al menos 3 caracteres")
    .max(200, "La dirección no puede superar los 200 caracteres")
    .required("La dirección es obligatoria"),
})

export const loginSchema = yup.object({
  email,
  password,
})

export const googleAuthSchema = yup.object({
  credential: yup
    .string()
    .trim()
    .max(4096, "El token de Google no es válido")
    .required("El token de Google (credential) es obligatorio"),
})

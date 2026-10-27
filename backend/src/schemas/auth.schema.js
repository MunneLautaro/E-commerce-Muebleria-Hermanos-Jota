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
  .required("La contraseña es obligatoria")

export const registerSchema = yup.object({
  email,
  password,
  phone: yup.string().trim().required("El teléfono es obligatorio"),
  address: yup.string().trim().required("La dirección es obligatoria"),
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

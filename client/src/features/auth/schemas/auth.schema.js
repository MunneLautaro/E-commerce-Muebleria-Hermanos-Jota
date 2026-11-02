import * as yup from "yup"

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Revisá el correo: no parece válido.")
    .required("Ingresá tu correo electrónico."),
  password: yup
    .string()
    .required("Ingresá tu contraseña."),
})

export const registerSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Revisá el correo: no parece válido.")
    .required("Ingresá tu correo electrónico."),
  phone: yup
    .string()
    .trim()
    .required("Ingresá un teléfono de contacto."),
  address: yup
    .string()
    .trim()
    .required("Ingresá tu dirección de entrega o contacto."),
  password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .required("Ingresá una contraseña."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden.")
    .required("Confirmá tu contraseña."),
})


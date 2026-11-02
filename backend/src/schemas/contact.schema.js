import * as yup from "yup"

export const createContactSchema = yup.object({
  nombre: yup
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres")
    .required("El nombre es obligatorio"),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Ingresá un correo electrónico válido")
    .max(254, "El correo no puede superar los 254 caracteres")
    .required("El correo electrónico es obligatorio"),
  telefono: yup
    .string()
    .trim()
    .matches(/^\d*$/, "El teléfono solo puede contener números")
    .max(30, "El teléfono no puede superar los 30 caracteres")
    .default(""),
  motivo: yup
    .string()
    .oneOf(["pieza", "showroom", "general"], "Elegí un motivo válido")
    .required("El motivo es obligatorio"),
  mensaje: yup
    .string()
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(1000, "El mensaje no puede superar los 1000 caracteres")
    .required("El mensaje es obligatorio"),
})

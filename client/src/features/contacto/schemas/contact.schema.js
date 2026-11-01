import * as yup from "yup"
import { limitesConsulta } from "../../../datos/contacto"

export const contactSchema = yup.object({
  nombre: yup
    .string()
    .trim()
    .min(limitesConsulta.nombreMin, "Ingresá tu nombre.")
    .max(limitesConsulta.nombreMax, "El nombre es demasiado largo.")
    .required("Ingresá tu nombre."),
  email: yup
    .string()
    .trim()
    .email("Revisá el correo: no parece válido.")
    .max(
      limitesConsulta.emailMax,
      "El correo no puede superar los 254 caracteres.",
    )
    .required("Ingresá tu correo electrónico."),
  telefono: yup
    .string()
    .trim()
    .matches(/^\d*$/, "El teléfono solo puede contener números.")
    .max(limitesConsulta.telefonoMax, "El teléfono es demasiado largo."),
  motivo: yup
    .string()
    .oneOf(["pieza", "showroom", "general"], "Elegí el motivo de tu consulta.")
    .required("Elegí el motivo de tu consulta."),
  mensaje: yup
    .string()
    .trim()
    .min(limitesConsulta.mensajeMin, "Contanos un poco más en tu mensaje.")
    .max(limitesConsulta.mensajeMax, "El mensaje supera el límite de caracteres.")
    .required("Contanos un poco más en tu mensaje."),
})

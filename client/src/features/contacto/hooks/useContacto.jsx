import { yupResolver } from "@hookform/resolvers/yup"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { limitesConsulta } from "../../../datos/contacto"
import { contactService } from "../services/contactService"
import { contactSchema } from "../schemas/contact.schema"

const valoresIniciales = {
  nombre: "",
  email: "",
  telefono: "",
  motivo: "",
  mensaje: "",
}

export const motivosConsulta = [
  { valor: "pieza", etiqueta: "Una pieza de la colección" },
  { valor: "showroom", etiqueta: "Visita al showroom" },
  { valor: "general", etiqueta: "Consulta general" },
]

export const useContacto = () => {
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const form = useForm({
    defaultValues: valoresIniciales,
    resolver: yupResolver(contactSchema),
    mode: "onBlur",
  })

  const enviar = async (valores) => {
    setEnviando(true)

    try {
      await contactService.sendInquiry({
        ...valores,
        nombre: valores.nombre.trim(),
        email: valores.email.trim().toLowerCase(),
        telefono: valores.telefono.trim(),
        mensaje: valores.mensaje.trim(),
      })
      form.reset(valoresIniciales)
      setExito(true)
      toast.success("¡Consulta enviada! Te vamos a responder a la brevedad.")
    } catch (error) {
      toast.error(error.message || "No se pudo enviar la consulta.")
    } finally {
      setEnviando(false)
    }
  }

  const reiniciar = () => {
    setExito(false)
    form.reset(valoresIniciales)
  }

  return {
    ...form,
    enviando,
    exito,
    limites: limitesConsulta,
    enviar,
    reiniciar,
  }
}

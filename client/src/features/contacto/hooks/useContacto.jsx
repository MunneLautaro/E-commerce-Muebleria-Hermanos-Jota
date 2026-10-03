import { useState } from "react"
import { limitesConsulta } from "../../../datos/contacto"

const valoresIniciales = {
  nombre: "",
  email: "",
  telefono: "",
  motivo: "",
  mensaje: "",
}

const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const motivosConsulta = [
  { valor: "pieza", etiqueta: "Una pieza de la colección" },
  { valor: "showroom", etiqueta: "Visita al showroom" },
  { valor: "general", etiqueta: "Consulta general" },
]

const validarCampos = (valores) => {
  const errores = {}
  const nombre = valores.nombre.trim()
  const email = valores.email.trim()
  const telefono = valores.telefono.trim()
  const motivo = valores.motivo.trim()
  const mensaje = valores.mensaje.trim()

  if (nombre.length < limitesConsulta.nombreMin) {
    errores.nombre = "Ingresá tu nombre."
  } else if (nombre.length > limitesConsulta.nombreMax) {
    errores.nombre = "El nombre es demasiado largo."
  }

  if (!email) {
    errores.email = "Ingresá tu correo electrónico."
  } else if (!emailValido.test(email)) {
    errores.email = "Revisá el correo: no parece válido."
  }

  if (telefono && telefono.length > limitesConsulta.telefonoMax) {
    errores.telefono = "El teléfono es demasiado largo."
  }

  if (!motivo) {
    errores.motivo = "Elegí el motivo de tu consulta."
  }

  if (mensaje.length < limitesConsulta.mensajeMin) {
    errores.mensaje = "Contanos un poco más en tu mensaje."
  } else if (mensaje.length > limitesConsulta.mensajeMax) {
    errores.mensaje = "El mensaje supera el límite de caracteres."
  }

  return errores
}

export const useContacto = () => {
  const [valores, setValores] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)

  const cambiarCampo = (evento) => {
    const { name, value } = evento.target
    setValores((previos) => ({ ...previos, [name]: value }))
    setErrores((previos) => ({ ...previos, [name]: undefined }))
  }

  const validarCampo = (evento) => {
    const { name } = evento.target
    const erroresCampo = validarCampos(valores)
    setErrores((previos) => ({ ...previos, [name]: erroresCampo[name] }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()

    const erroresLocales = validarCampos(valores)
    if (Object.keys(erroresLocales).length > 0) {
      setErrores(erroresLocales)
      return
    }

    setEnviando(true)

    await new Promise((resolver) => {
      window.setTimeout(resolver, 700)
    })

    setValores(valoresIniciales)
    setErrores({})
    setEnviando(false)
    setExito(true)
  }

  const reiniciar = () => {
    setExito(false)
    setErrores({})
    setValores(valoresIniciales)
  }

  return {
    valores,
    errores,
    enviando,
    exito,
    limites: limitesConsulta,
    cambiarCampo,
    validarCampo,
    enviar,
    reiniciar,
  }
}

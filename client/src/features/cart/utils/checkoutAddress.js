export const CHECKOUT_ADDRESS_STORAGE_KEY = "hj-checkout-address"

export const emptyCheckoutAddress = {
  nombreCompleto: "",
  telefono: "",
  direccion: "",
  altura: "",
  ciudad: "",
  codigoPostal: "",
}

export const CHECKOUT_ADDRESS_FIELDS = [
  { name: "nombreCompleto", label: "Nombre completo", type: "text", autoComplete: "name", maxLength: 100 },
  { name: "telefono", label: "Teléfono", type: "tel", autoComplete: "tel", maxLength: 30 },
  { name: "direccion", label: "Dirección", type: "text", autoComplete: "street-address", maxLength: 120 },
  { name: "altura", label: "Altura", type: "text", autoComplete: "address-line2", maxLength: 10 },
  { name: "ciudad", label: "Ciudad", type: "text", autoComplete: "address-level2", maxLength: 80 },
  { name: "codigoPostal", label: "Código postal", type: "text", autoComplete: "postal-code", maxLength: 8 },
]

const PHONE_PATTERN = /^[\d\s()+-]{6,30}$/
const POSTAL_CODE_PATTERN = /^[A-Za-z\d]{4,8}$/

const fieldRules = {
  nombreCompleto: { required: "Ingresá tu nombre completo." },
  telefono: {
    required: "Ingresá tu teléfono de contacto.",
    pattern: PHONE_PATTERN,
    invalid: "Ingresá un teléfono válido.",
  },
  direccion: { required: "Ingresá tu dirección de entrega." },
  altura: { required: "Ingresá el número de la dirección." },
  ciudad: { required: "Ingresá tu ciudad." },
  codigoPostal: {
    required: "Ingresá tu código postal.",
    pattern: POSTAL_CODE_PATTERN,
    invalid: "Ingresá un código postal válido.",
  },
}

const validateField = (value, { required, pattern, invalid }) => {
  const trimmed = String(value ?? "").trim()
  if (!trimmed) return required
  if (pattern && !pattern.test(trimmed)) return invalid
  return ""
}

export const validateCheckoutAddress = (address) =>
  Object.fromEntries(
    Object.entries(fieldRules).map(([field, rules]) => [
      field,
      validateField(address[field], rules),
    ]),
  )

export const toShippingData = (address) =>
  Object.fromEntries(
    Object.keys(emptyCheckoutAddress).map((field) => [
      field,
      String(address[field] ?? "").trim(),
    ]),
  )

export const hasAddressErrors = (errors) => Object.values(errors).some(Boolean)

const emptyResult = () => ({ address: emptyCheckoutAddress, shouldSave: false })

export const loadCheckoutAddress = () => {
  if (typeof window === "undefined") return emptyResult()

  try {
    const stored = window.localStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY)
    if (!stored) return emptyResult()

    const address = JSON.parse(stored)
    if (!address || typeof address !== "object") return emptyResult()

    return {
      address: { ...emptyCheckoutAddress, ...address },
      shouldSave: true,
    }
  } catch {
    return emptyResult()
  }
}

export const persistCheckoutAddress = (address, shouldSave) => {
  try {
    if (shouldSave) {
      window.localStorage.setItem(
        CHECKOUT_ADDRESS_STORAGE_KEY,
        JSON.stringify(address),
      )
    } else {
      window.localStorage.removeItem(CHECKOUT_ADDRESS_STORAGE_KEY)
    }
    return true
  } catch {
    return false
  }
}

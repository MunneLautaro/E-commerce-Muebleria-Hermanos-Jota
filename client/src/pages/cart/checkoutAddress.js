export const CHECKOUT_ADDRESS_STORAGE_KEY = "hj-checkout-address"

export const emptyCheckoutAddress = {
  nombreCompleto: "",
  telefono: "",
  direccion: "",
  altura: "",
  ciudad: "",
  codigoPostal: "",
}

export const loadCheckoutAddress = () => {
  if (typeof window === "undefined") {
    return { address: emptyCheckoutAddress, shouldSave: false }
  }

  try {
    const stored = window.localStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY)
    if (!stored) {
      return { address: emptyCheckoutAddress, shouldSave: false }
    }

    const address = JSON.parse(stored)
    if (!address || typeof address !== "object") {
      return { address: emptyCheckoutAddress, shouldSave: false }
    }

    return {
      address: { ...emptyCheckoutAddress, ...address },
      shouldSave: true,
    }
  } catch {
    return { address: emptyCheckoutAddress, shouldSave: false }
  }
}

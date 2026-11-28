import {
  CHECKOUT_ADDRESS_STORAGE_KEY,
  emptyCheckoutAddress,
  hasAddressErrors,
  loadCheckoutAddress,
  persistCheckoutAddress,
  toShippingData,
  validateCheckoutAddress,
} from "./checkoutAddress"

const address = {
  nombreCompleto: "Ana Pérez",
  telefono: "11 5555-1234",
  direccion: "Av. Corrientes",
  altura: "1234",
  ciudad: "Buenos Aires",
  codigoPostal: "1043",
}

describe("checkoutAddress", () => {
  test("marca como obligatorios los campos vacíos o con espacios", () => {
    const errors = validateCheckoutAddress({ ...address, ciudad: "   " })

    expect(errors.ciudad).toBe("Ingresá tu ciudad.")
    expect(errors.nombreCompleto).toBe("")
    expect(hasAddressErrors(errors)).toBe(true)
    expect(hasAddressErrors(validateCheckoutAddress(address))).toBe(false)
  })

  test("valida el formato del teléfono y del código postal como el backend", () => {
    const errors = validateCheckoutAddress({
      ...address,
      telefono: "llamame",
      codigoPostal: "10-43",
    })

    expect(errors.telefono).toBe("Ingresá un teléfono válido.")
    expect(errors.codigoPostal).toBe("Ingresá un código postal válido.")
    expect(validateCheckoutAddress({ ...address, codigoPostal: "C1043AAZ" }).codigoPostal).toBe("")
  })

  test("arma los datos de envío sin espacios sobrantes ni campos extra", () => {
    expect(
      toShippingData({ ...address, nombreCompleto: "  Ana Pérez ", piso: "3B" }),
    ).toEqual(address)
  })

  test("devuelve una dirección vacía si no hay nada guardado o está corrupto", () => {
    expect(loadCheckoutAddress()).toEqual({
      address: emptyCheckoutAddress,
      shouldSave: false,
    })

    window.localStorage.setItem(CHECKOUT_ADDRESS_STORAGE_KEY, "{no-es-json")
    expect(loadCheckoutAddress().shouldSave).toBe(false)
  })

  test("guarda y borra la dirección según la preferencia del usuario", () => {
    persistCheckoutAddress(address, true)
    expect(loadCheckoutAddress()).toEqual({ address, shouldSave: true })

    persistCheckoutAddress(address, false)
    expect(window.localStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY)).toBeNull()
  })
})

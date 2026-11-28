import { screen } from "@testing-library/react"
import { useLocation } from "react-router-dom"
import { renderWithProviders } from "../../../../test/renderWithProviders"
import { RegisterForm } from "./RegisterForm"

vi.mock("@react-oauth/google", () => ({ GoogleLogin: () => null }))
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const LocationProbe = () => {
  const { pathname, state } = useLocation()
  return (
    <>
      <span data-testid="pathname">{pathname}</span>
      <span data-testid="state">{JSON.stringify(state ?? null)}</span>
    </>
  )
}

const renderRegister = (options) =>
  renderWithProviders(
    <>
      <RegisterForm />
      <LocationProbe />
    </>,
    { route: "/register", routeState: { from: "/carrito" }, ...options },
  )

describe("RegisterForm", () => {
  afterEach(() => vi.clearAllMocks())

  test("después de registrarse manda al login conservando la página de origen", async () => {
    const { user, auth } = renderRegister({
      auth: { register: vi.fn().mockResolvedValue() },
    })

    await user.type(screen.getByLabelText("Correo electrónico"), "Ana@Mail.com")
    await user.type(screen.getByLabelText("Teléfono"), "11 5555-1234")
    await user.type(screen.getByLabelText("Dirección"), "Av. Corrientes 1234")
    await user.type(screen.getByLabelText("Contraseña"), "secreta123")
    await user.type(screen.getByLabelText("Confirmar contraseña"), "secreta123")
    await user.click(screen.getByRole("button", { name: "Registrarme" }))

    expect(auth.register).toHaveBeenCalled()
    expect(await screen.findByTestId("pathname")).toHaveTextContent("/login")
    expect(JSON.parse(screen.getByTestId("state").textContent)).toEqual({
      from: "/carrito",
      email: "ana@mail.com",
    })
  })

  test("el enlace al login conserva la página de origen", async () => {
    const { user } = renderRegister()

    await user.click(screen.getByRole("link", { name: "Iniciá sesión aquí" }))

    expect(screen.getByTestId("pathname")).toHaveTextContent("/login")
    expect(JSON.parse(screen.getByTestId("state").textContent)).toEqual({
      from: "/carrito",
    })
  })
})

import { screen } from "@testing-library/react"
import { useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { renderWithProviders } from "../../../../test/renderWithProviders"
import { LoginForm } from "./LoginForm"

vi.mock("@react-oauth/google", () => ({ GoogleLogin: () => null }))
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const submit = (user) =>
  user.click(screen.getByRole("button", { name: "Ingresar a mi cuenta" }))

describe("LoginForm", () => {
  afterEach(() => vi.clearAllMocks())

  test("muestra errores de validación si se envía vacío", async () => {
    const { user, auth } = renderWithProviders(<LoginForm />)

    await submit(user)

    expect(
      await screen.findByText("Ingresá tu correo electrónico."),
    ).toBeInTheDocument()
    expect(screen.getByText("Ingresá tu contraseña.")).toBeInTheDocument()
    expect(auth.login).not.toHaveBeenCalled()
  })

  test("normaliza el email y llama a login", async () => {
    const { user, auth } = renderWithProviders(<LoginForm />, {
      auth: { login: vi.fn().mockResolvedValue() },
    })

    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "  Admin@Mail.com ",
    )
    await user.type(screen.getByLabelText("Contraseña"), "secreta123")
    await submit(user)

    expect(auth.login).toHaveBeenCalledWith({
      email: "admin@mail.com",
      password: "secreta123",
    })
    expect(toast.success).toHaveBeenCalled()
  })

  test("muestra el error que devuelve el servidor", async () => {
    const { user } = renderWithProviders(<LoginForm />, {
      auth: {
        login: vi.fn().mockRejectedValue(new Error("Credenciales inválidas")),
      },
    })

    await user.type(screen.getByLabelText("Correo electrónico"), "a@b.com")
    await user.type(screen.getByLabelText("Contraseña"), "x")
    await submit(user)

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciales inválidas",
    )
    expect(toast.error).toHaveBeenCalledWith("Credenciales inválidas")
  })

  test("vuelve a la página de origen después de iniciar sesión", async () => {
    const PathnameProbe = () => (
      <span data-testid="pathname">{useLocation().pathname}</span>
    )
    const { user } = renderWithProviders(
      <>
        <LoginForm />
        <PathnameProbe />
      </>,
      {
        route: "/login",
        routeState: { from: "/carrito" },
        auth: { login: vi.fn().mockResolvedValue() },
      },
    )

    await user.type(screen.getByLabelText("Correo electrónico"), "a@b.com")
    await user.type(screen.getByLabelText("Contraseña"), "secreta123")
    await submit(user)

    expect(await screen.findByTestId("pathname")).toHaveTextContent("/carrito")
  })

  test("el enlace al registro conserva la página de origen", async () => {
    const StateProbe = () => (
      <span data-testid="state">{JSON.stringify(useLocation().state ?? null)}</span>
    )
    const { user } = renderWithProviders(
      <>
        <LoginForm />
        <StateProbe />
      </>,
      { route: "/login", routeState: { from: "/carrito", email: "a@b.com" } },
    )

    await user.click(screen.getByRole("link", { name: "Registrate acá" }))

    expect(JSON.parse(screen.getByTestId("state").textContent)).toEqual({
      from: "/carrito",
    })
  })

  test("precarga el email recibido por location.state", () => {
    renderWithProviders(<LoginForm />, {
      route: "/login",
      routeState: { email: "nuevo@mail.com" },
    })

    expect(screen.getByLabelText("Correo electrónico")).toHaveValue(
      "nuevo@mail.com",
    )
  })

  test("permite mostrar y ocultar la contraseña", async () => {
    const { user } = renderWithProviders(<LoginForm />)
    const password = screen.getByLabelText("Contraseña")

    expect(password).toHaveAttribute("type", "password")
    await user.click(screen.getByRole("button", { name: "Ver contraseña" }))
    expect(password).toHaveAttribute("type", "text")
  })
})

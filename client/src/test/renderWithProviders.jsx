import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { AuthContext } from "../features/auth/context/AuthContext"

const defaultAuth = () => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
})

export const renderWithProviders = (
  ui,
  { route = "/", routeState, auth: authOverrides = {} } = {},
) => {
  const auth = { ...defaultAuth(), ...authOverrides }
  const [pathname, search = ""] = route.split("?")
  const initialEntry = {
    pathname,
    search: search ? `?${search}` : "",
    state: routeState,
  }

  const result = render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[initialEntry]}>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>,
  )

  return { ...result, user: userEvent.setup(), auth }
}

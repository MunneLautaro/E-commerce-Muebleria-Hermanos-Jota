import { CartProvider } from "../context/CartContext"
import { AppProviders } from "./providers"
import { AppRouter } from "./router"

function App() {
  return (
    <AppProviders>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AppProviders>
  )
}

export default App

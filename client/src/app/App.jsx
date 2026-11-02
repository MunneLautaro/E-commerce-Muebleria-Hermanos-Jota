import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../styles/toastify-overrides.css"
import { CartProvider } from "../features/cart"
import { AuthProvider } from "../features/auth"
import { AppProviders } from "./providers"
import { AppRouter } from "./router"

function App() {
  return (
    <AppProviders>
      <AuthProvider>
        <CartProvider>
        <AppRouter />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </CartProvider>
      </AuthProvider>
    </AppProviders>
  )
}

export default App

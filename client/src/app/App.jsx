import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../styles/toastify-overrides.css"
import { CartProvider } from "../features/cart"
import { AppProviders } from "./providers"
import { AppRouter } from "./router"

function App() {
  return (
    <AppProviders>
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
    </AppProviders>
  )
}

export default App

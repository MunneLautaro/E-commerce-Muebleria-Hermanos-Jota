import { BrowserRouter } from "react-router-dom"

export const AppProviders = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

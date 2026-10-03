import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "../components/Layout/Layout"
import HomePage from "../pages/Home"
import ContactoPage from "../pages/Contacto/ContactoPage"

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/contacto" element={<ContactoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

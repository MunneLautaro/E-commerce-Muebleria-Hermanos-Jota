import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "../components/Layout/Layout"
import HomePage from "../pages/Home"
import ProductsPage from "../pages/products/Products"
import ProductDetail from "../features/products/components/ProductDetail/ProductDetail"
import ContactPage from "../pages/contact/ContactPage"

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/productos/:id" element={<ProductDetail />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

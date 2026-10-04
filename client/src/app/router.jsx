import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "../components/Layout/Layout"
import HomePage from "../pages/home/Home"
import ProductsPage from "../pages/products/Products"
import ProductDetail from "../pages/productDetail/ProductDetail"
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

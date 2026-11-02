import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "../components/Layout/Layout"
import HomePage from "../pages/home/Home"
import ProductsPage from "../pages/products/Products"
import ProductDetail from "../pages/productDetail/ProductDetail"
import ContactPage from "../pages/contact/ContactPage"
import LoginPage from "../pages/login/LoginPage"
import RegisterPage from "../pages/register/RegisterPage"
import AdminProductsPage from "../pages/admin/AdminProductsPage"
import CreateProductPage from "../pages/admin/CreateProductPage"

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/productos/:id" element={<ProductDetail />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminProductsPage />} />
        <Route path="/admin/crear-producto" element={<CreateProductPage />} />
        <Route
          path="/admin/editar-producto/:id"
          element={<CreateProductPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

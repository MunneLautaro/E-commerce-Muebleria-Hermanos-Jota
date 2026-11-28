import { lazy } from "react"
import { Navigate, Routes, Route } from "react-router-dom"
import { Layout } from "../components/Layout/Layout"
import HomePage from "../pages/home/Home"

const ProductsPage = lazy(() => import("../pages/products/Products"))
const ProductDetail = lazy(() => import("../pages/productDetail/ProductDetail"))
const ContactPage = lazy(() => import("../pages/contact/ContactPage"))
const LoginPage = lazy(() => import("../pages/login/LoginPage"))
const RegisterPage = lazy(() => import("../pages/register/RegisterPage"))
const CartPage = lazy(() => import("../pages/cart/CartPage"))
const AdminProductsPage = lazy(() => import("../pages/admin/AdminProductsPage"))
const CreateProductPage = lazy(() => import("../pages/admin/CreateProductPage"))
const NotFoundPage = lazy(() => import("../pages/notFound/NotFoundPage"))
const PurchaseConfirmationPage = lazy(() => import("../pages/purchaseConfirmation/PurchaseConfirmationPage"))
const MyOrdersPage = lazy(() => import("../pages/myOrders/MyOrdersPage"))

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
        <Route path="/carrito" element={<CartPage />} />
        <Route
          path="/admin"
          element={<Navigate to="/admin/productos" replace />}
        />
        <Route path="/admin/productos" element={<AdminProductsPage />} />
        <Route path="/admin/crear-producto" element={<CreateProductPage />} />
        <Route
          path="/admin/editar-producto/:id"
          element={<CreateProductPage />}
        />
        <Route path="/compra-confirmada" element={<PurchaseConfirmationPage />} />
        <Route path="/mis-ordenes" element={<MyOrdersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

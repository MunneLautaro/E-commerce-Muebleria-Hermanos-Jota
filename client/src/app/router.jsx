import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "../components/Layout/Layout"
import HomePage from "../pages/Home"
import ProductsPage from "../pages/products/Products"

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/productos" element={<ProductsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "../components/Layout/Layout"
import HomePage from "../pages/Home"

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

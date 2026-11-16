import { tokenStorage } from "./tokenStorage"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

const buildHeaders = (customHeaders = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  }

  const token = tokenStorage.get()
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function fetchApi(endpoint, options = {}) {
  const { headers: customHeaders, ...fetchOptions } = options

  let response
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: buildHeaders(customHeaders),
    })
  } catch {
    throw new Error(
      "No se pudo conectar con el backend. Verificá que esté ejecutándose en el puerto 3000.",
    )
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const details = Array.isArray(errorData.details)
      ? errorData.details.join(". ")
      : null
    const error = new Error(
      details ||
        errorData.error ||
        errorData.message ||
        `Error ${response.status}: ${response.statusText}`,
    )
    error.status = response.status
    throw error
  }

  return response.json()
}

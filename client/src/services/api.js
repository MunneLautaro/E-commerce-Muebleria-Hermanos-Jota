const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export async function fetchApi(endpoint, options = {}) {
  let response
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
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
    throw new Error(
      details ||
        errorData.error ||
        errorData.message ||
        `Error ${response.status}: ${response.statusText}`,
    )
  }

  return response.json()
}

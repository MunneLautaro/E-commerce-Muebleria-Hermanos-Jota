const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `Error ${response.status}: ${response.statusText}`,
    )
  }

  return response.json()
}

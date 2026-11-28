export const getRedirectPath = (state, fallback = "/") => {
  const from = state?.from
  if (typeof from !== "string") return fallback
  if (!from.startsWith("/") || from.startsWith("//")) return fallback
  return from
}

export const getRedirectState = (state) => {
  const from = getRedirectPath(state, null)
  return from ? { from } : undefined
}

const hasValue = (value) => value !== undefined && value !== null && value !== ""

export const withQuery = (path, params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => hasValue(value))
  const query = new URLSearchParams(entries).toString()
  return query ? `${path}?${query}` : path
}

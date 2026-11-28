import { ORDER_STATUS_VALUES } from "../../orders"

export const PAGE_SIZE_OPTIONS = [12, 15, 20]
export const DEFAULT_PAGE_SIZE = 20
export const SEARCH_MAX_LENGTH = 100
export const SEARCH_DEBOUNCE_MS = 400
export const PRODUCT_STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "activos", label: "Activos" },
  { value: "inactivos", label: "Inactivos" },
]

const MAX_PAGE = 10000
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const parsePage = (value) => {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : 1
}

export const parseLimit = (value) => {
  const limit = Number(value)
  return PAGE_SIZE_OPTIONS.includes(limit) ? limit : DEFAULT_PAGE_SIZE
}

export const parseOption = (value, options, fallback) =>
  options.includes(value) ? value : fallback

export const parseDate = (value) => {
  if (!DATE_PATTERN.test(value ?? "")) return ""
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    ? value
    : ""
}

export const parseSearch = (value) => {
  const search = (value ?? "").trim()
  return search.length <= SEARCH_MAX_LENGTH ? search : ""
}

export const ORDER_LIST_DEFAULTS = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  estado: "",
  desde: "",
  hasta: "",
  q: "",
}

export const parseOrderListParams = (searchParams) => {
  const desde = parseDate(searchParams.get("desde"))
  const hasta = parseDate(searchParams.get("hasta"))
  const validRange = !desde || !hasta || desde <= hasta

  return {
    page: parsePage(searchParams.get("page")),
    limit: parseLimit(searchParams.get("limit")),
    estado: parseOption(searchParams.get("estado"), ORDER_STATUS_VALUES, ""),
    desde: validRange ? desde : "",
    hasta: validRange ? hasta : "",
    q: parseSearch(searchParams.get("q")),
  }
}

export const PRODUCT_LIST_DEFAULTS = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  estado: "todos",
  q: "",
}

export const parseProductListParams = (searchParams) => ({
  page: parsePage(searchParams.get("page")),
  limit: parseLimit(searchParams.get("limit")),
  estado: parseOption(
    searchParams.get("estado"),
    PRODUCT_STATUS_OPTIONS.map(({ value }) => value),
    "todos",
  ),
  q: parseSearch(searchParams.get("q")),
})

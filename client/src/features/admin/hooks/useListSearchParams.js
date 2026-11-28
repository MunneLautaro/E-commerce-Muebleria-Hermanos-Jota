import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

const isDefault = (value, defaultValue) =>
  value === undefined ||
  value === null ||
  value === "" ||
  String(value) === String(defaultValue)

export function useListSearchParams(parseParams, defaults) {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(
    () => parseParams(searchParams),
    [parseParams, searchParams],
  )

  const updateParams = useCallback(
    (changes) => {
      const changesPage = "page" in changes

      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)

          for (const [key, value] of Object.entries(changes)) {
            if (isDefault(value, defaults[key])) next.delete(key)
            else next.set(key, String(value))
          }

          if (!changesPage) next.delete("page")
          return next
        },
        { replace: !changesPage },
      )
    },
    [setSearchParams, defaults],
  )

  return { params, updateParams }
}

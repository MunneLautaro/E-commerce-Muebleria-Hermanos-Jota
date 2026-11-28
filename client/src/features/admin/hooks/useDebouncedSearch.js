import { useEffect, useState } from "react"
import { SEARCH_DEBOUNCE_MS } from "../utils/listParams"

export function useDebouncedSearch(committedValue, onCommit, delay = SEARCH_DEBOUNCE_MS) {
  const [term, setTerm] = useState(committedValue)
  const [lastCommitted, setLastCommitted] = useState(committedValue)

  if (committedValue !== lastCommitted) {
    setLastCommitted(committedValue)
    if (term.trim() !== committedValue) setTerm(committedValue)
  }

  useEffect(() => {
    const normalized = term.trim()
    if (normalized === committedValue) return undefined

    const timeoutId = setTimeout(() => onCommit(normalized), delay)
    return () => clearTimeout(timeoutId)
  }, [term, committedValue, onCommit, delay])

  return [term, setTerm]
}

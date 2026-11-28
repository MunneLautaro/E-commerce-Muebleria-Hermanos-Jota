import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"

const initialState = { request: null, reloadCount: -1, data: null, error: "" }

export function useRequest(request, { enabled = true, errorMessage }) {
  const [reloadCount, setReloadCount] = useState(0)
  const [state, setState] = useState(initialState)

  useEffect(() => {
    if (!enabled) return undefined

    let isActive = true

    const run = async () => {
      try {
        const data = await request()
        if (isActive) setState({ request, reloadCount, data, error: "" })
      } catch (requestError) {
        if (!isActive) return
        console.error(requestError)
        toast.error(requestError.message || errorMessage)
        setState({ request, reloadCount, data: null, error: errorMessage })
      }
    }

    void run()
    return () => {
      isActive = false
    }
  }, [enabled, request, reloadCount, errorMessage])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])
  const isLoading =
    state.request !== request || state.reloadCount !== reloadCount

  return {
    data: state.data,
    error: isLoading ? "" : state.error,
    isLoading,
    reload,
  }
}

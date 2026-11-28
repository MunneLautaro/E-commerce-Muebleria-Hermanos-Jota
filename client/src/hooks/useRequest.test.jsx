import { act, renderHook, waitFor } from "@testing-library/react"
import { toast } from "react-toastify"
import { useRequest } from "./useRequest"

const options = { errorMessage: "No se pudo cargar." }

describe("useRequest", () => {
  afterEach(() => vi.restoreAllMocks())

  test("carga los datos y deja de estar cargando", async () => {
    const request = vi.fn().mockResolvedValue({ items: [1] })

    const { result } = renderHook(() => useRequest(request, options))

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual({ items: [1] })
    expect(result.current.error).toBe("")
  })

  test("no pide nada si no está habilitado", () => {
    const request = vi.fn().mockResolvedValue({})

    renderHook(() => useRequest(request, { ...options, enabled: false }))

    expect(request).not.toHaveBeenCalled()
  })

  test("guarda el error, avisa con un toast y permite reintentar", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const toastError = vi.spyOn(toast, "error").mockImplementation(() => {})
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error("Error 500"))
      .mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() => useRequest(request, options))

    await waitFor(() => expect(result.current.error).toBe("No se pudo cargar."))
    expect(toastError).toHaveBeenCalledWith("Error 500")

    act(() => result.current.reload())

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.data).toEqual({ ok: true }))
    expect(request).toHaveBeenCalledTimes(2)
  })

  test("ignora la respuesta de un pedido viejo", async () => {
    let resolveOld
    const oldRequest = () => new Promise((resolve) => (resolveOld = resolve))
    const newRequest = vi.fn().mockResolvedValue("nuevo")

    const { result, rerender } = renderHook(
      ({ request }) => useRequest(request, options),
      { initialProps: { request: oldRequest } },
    )
    rerender({ request: newRequest })

    await waitFor(() => expect(result.current.data).toBe("nuevo"))
    await act(async () => resolveOld("viejo"))

    expect(result.current.data).toBe("nuevo")
  })
})

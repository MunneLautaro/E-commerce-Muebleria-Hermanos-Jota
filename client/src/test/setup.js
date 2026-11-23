import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { server } from "./msw/server"

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function close() {
    this.open = false
  }
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  window.localStorage.clear()
})

afterAll(() => server.close())

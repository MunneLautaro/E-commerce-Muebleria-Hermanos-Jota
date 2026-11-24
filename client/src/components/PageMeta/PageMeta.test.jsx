import { render } from "@testing-library/react"
import { PageMeta } from "./PageMeta"
import { SITE_NAME } from "./pageTitle"

const getMeta = (name) =>
  document.head.querySelector(`meta[name="${name}"]`)

describe("PageMeta", () => {
  test("usa el nombre del sitio como título cuando no recibe uno", () => {
    render(<PageMeta />)

    expect(document.title).toBe(SITE_NAME)
  })

  test("antepone el título de la página al nombre del sitio", () => {
    render(<PageMeta title="Catálogo" />)

    expect(document.title).toBe(`Catálogo | ${SITE_NAME}`)
  })

  test("agrega la descripción al head", () => {
    render(<PageMeta description="Muebles de diseño" />)

    expect(getMeta("description")).toHaveAttribute(
      "content",
      "Muebles de diseño",
    )
  })

  test("no agrega robots ni canonical por defecto", () => {
    render(<PageMeta title="Inicio" />)

    expect(getMeta("robots")).toBeNull()
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
  })

  test("pide no indexar la página cuando recibe noIndex", () => {
    render(<PageMeta noIndex />)

    expect(getMeta("robots")).toHaveAttribute("content", "noindex, nofollow")
  })

  test("arma la URL canónica absoluta a partir del path", () => {
    render(<PageMeta canonicalPath="/contact" />)

    expect(
      document.head.querySelector('link[rel="canonical"]'),
    ).toHaveAttribute("href", `${globalThis.location.origin}/contact`)
  })

  test("quita las etiquetas del head al desmontarse", () => {
    const { unmount } = render(<PageMeta description="Temporal" noIndex />)

    unmount()

    expect(getMeta("description")).toBeNull()
    expect(getMeta("robots")).toBeNull()
  })
})

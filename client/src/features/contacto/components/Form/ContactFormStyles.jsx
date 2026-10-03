const controlBase =
  "w-full rounded-marca border bg-white px-4 py-3 text-ink font-body font-normal normal-case tracking-normal leading-[1.6] placeholder:text-ink-soft transition-colors"

export const contactFormStyles = {
  form: "flex flex-col gap-6",
  fila: "grid gap-6 md:grid-cols-2",
  campo: "flex flex-col gap-2",
  etiqueta: "font-medium uppercase tracking-cta text-sm text-ink",
  opcional: "ml-2 font-normal normal-case tracking-normal text-ink-soft",
  control: (invalido) =>
    `${controlBase} ${invalido ? "border-error" : "border-linea"}`,
  textarea: (invalido) =>
    `${controlBase} min-h-32 resize-y ${invalido ? "border-error" : "border-linea"}`,
  errorCampo: "font-light text-sm tracking-caption text-error",
  ayuda: "font-light text-sm tracking-caption text-ink-soft",
  alertaExito: "flex flex-col gap-4 border-l-4 border-siena bg-panel-salvia p-8",
  tituloExito: "font-display uppercase tracking-title text-siena text-xl",
  textoExito: "text-ink leading-[1.6]",
  acciones: "pt-2",
  boton:
    "bg-siena text-white px-6 py-3 rounded-marca font-medium uppercase tracking-cta hover:bg-ink transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  botonSecundario:
    "border border-siena text-siena px-6 py-3 rounded-marca font-medium uppercase tracking-cta hover:bg-alabastro transition-colors w-fit",
}

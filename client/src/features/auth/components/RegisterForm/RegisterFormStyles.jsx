const controlBase =
  "w-full rounded-marca border bg-white px-4 py-3 text-ink font-body font-normal normal-case tracking-normal leading-[1.6] placeholder:text-ink-soft/70 transition-colors focus:border-siena"

export const registerFormStyles = {
  form: "flex flex-col gap-5",
  fila: "grid gap-5 md:grid-cols-2",
  campo: "flex flex-col gap-2",
  etiqueta: "font-medium uppercase tracking-cta text-xs sm:text-sm text-ink",
  control: (invalido) =>
    `${controlBase} ${invalido ? "border-error" : "border-linea"}`,
  errorCampo: "font-light text-xs sm:text-sm tracking-caption text-error",
  errorGeneral:
    "rounded-marca border border-error/30 bg-error-bg p-3 text-sm text-error",
  ayuda: "font-light text-xs tracking-caption text-ink-soft",
  acciones: "pt-2 flex flex-col gap-4",
  boton:
    "w-full bg-siena text-white px-6 py-3.5 rounded-marca font-medium uppercase tracking-cta hover:bg-ink transition-colors disabled:cursor-not-allowed disabled:opacity-60 shadow-tarjeta",
  pie: "text-center text-sm text-ink-soft pt-2",
  enlace:
    "font-medium text-siena hover:text-ink transition-colors underline ml-1",
}


export const productFormStyles = {
  form: "space-y-6",
  section:
    "rounded-2xl border border-[#A0522D]/15 bg-white/90 p-5 shadow-marca sm:p-8",
  sectionHeading: "mb-6 border-b border-linea pb-4",
  sectionTitle: "text-xl",
  sectionDescription: "mt-2 text-sm text-ink-soft",
  fields: "grid gap-5 sm:grid-cols-2",
  label: "block text-sm font-medium text-ink",
  wideLabel: "block text-sm font-medium text-ink sm:col-span-2",
  input:
    "mt-2 w-full rounded-lg border border-[#A0522D]/20 bg-white px-4 py-3 text-sm text-ink shadow-sm transition placeholder:text-ink-soft/60 focus:border-siena focus:outline-none focus:ring-2 focus:ring-siena/15",
  textarea: "min-h-28 resize-y",
  help: "mt-2 block text-xs font-normal text-ink-soft",
  fieldError: "mt-1 block text-xs text-error",
  imagePreview:
    "h-52 w-full rounded-lg border border-linea bg-[#F5E6D3] object-contain p-3",
  imageError: "text-sm text-error sm:col-span-2",
  activeToggle:
    "flex items-center gap-3 rounded-lg bg-crema px-4 py-3 text-sm text-ink sm:col-span-2",
  checkbox: "h-4 w-4 accent-siena",
  attributesHeader:
    "flex flex-wrap items-start justify-between gap-4 border-b border-linea pb-4",
  addButton:
    "inline-flex items-center gap-2 rounded-lg border border-siena/30 px-4 py-2 text-xs font-semibold text-siena transition hover:bg-crema disabled:cursor-not-allowed disabled:opacity-50",
  emptyAttributes:
    "mt-5 rounded-lg border border-dashed border-[#A0522D]/25 bg-crema/60 px-4 py-8 text-center",
  emptyIcon: "mx-auto mb-2 text-salvia",
  attributesList: "mt-5 space-y-3",
  attributeRow:
    "grid gap-3 rounded-xl border border-linea bg-crema/50 p-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end",
  removeButton:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm text-error transition hover:bg-error-bg",
  footer: "flex flex-col-reverse justify-end gap-3 sm:flex-row",
  cancelButton:
    "inline-flex min-h-12 items-center justify-center rounded-lg border border-siena/30 px-6 text-sm font-semibold text-siena transition hover:bg-crema",
  submitButton:
    "inline-flex min-h-12 items-center justify-center rounded-lg bg-siena px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7f4222] disabled:cursor-not-allowed disabled:opacity-60",
}

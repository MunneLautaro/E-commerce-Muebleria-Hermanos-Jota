export const checkoutProgressStyles = {
  list: "mb-4 grid grid-cols-3 rounded-marca border border-linea bg-crema p-2",
  step: (active) =>
    `flex items-center justify-center gap-2 px-2 py-2 ${active ? "rounded-marca bg-alabastro text-siena" : "text-ink-soft"}`,
  number:
    "flex h-7 w-7 items-center justify-center rounded-full border border-linea bg-white text-xs font-medium",
  label: "hidden text-xs font-medium sm:inline",
  stepText: "mb-6 text-xs font-medium uppercase tracking-caption text-salvia",
}

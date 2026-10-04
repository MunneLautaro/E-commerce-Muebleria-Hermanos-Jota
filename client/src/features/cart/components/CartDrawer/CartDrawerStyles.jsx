export const cartDrawerStyles = {
  trashIcon: "h-4 w-4",
  closeIcon: "h-5 w-5",
  overlay: (isOpen) =>
    `fixed inset-0 z-40 bg-[#3a2622]/30 transition-opacity duration-300 ${
      isOpen ? "opacity-100" : "pointer-events-none opacity-0"
    }`,
  aside: (isOpen) =>
    `fixed right-0 top-0 z-50 flex h-full w-[420px] max-w-[90vw] flex-col border-l border-linea bg-crema shadow-2xl transition-transform duration-300 ease-out ${
      isOpen ? "translate-x-0" : "translate-x-full"
    }`,
  header: "flex items-center justify-between border-b border-linea px-5 py-4",
  subtitle:
    "text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft",
  title: "mt-1 font-display text-xl text-siena",
  closeButton:
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-linea text-siena transition-colors hover:bg-alabastro",
  content: "flex-1 overflow-y-auto px-5 py-5",
  loadingText: "text-sm text-ink-soft",
  errorText: "text-sm text-error",
  emptyContainer:
    "flex h-full flex-col items-center justify-center text-center",
  emptyIconWrapper:
    "mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-alabastro text-siena",
  emptyIcon: "h-7 w-7",
  emptyTitle: "font-display text-lg text-siena",
  emptyText: "mt-2 text-sm text-ink-soft",
  itemList: "space-y-4",
  itemCard:
    "flex items-center gap-3 rounded-marca border border-linea bg-white p-3 shadow-tarjeta",
  itemImage: "h-16 w-16 rounded-full border border-linea object-cover",
  itemInfo: "min-w-0 flex-1",
  itemName: "truncate font-medium text-ink",
  quantityControls: "mt-2 flex items-center gap-2",
  quantityButton:
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-linea text-siena transition-colors hover:bg-alabastro",
  quantityText: "min-w-9 text-center text-sm font-medium text-ink-soft",
  removeButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-linea text-error transition-colors hover:bg-error-bg",
}

const cardState = (isRemoving, isHighlighted) => {
  if (isRemoving) {
    return "pointer-events-none translate-x-2 scale-[0.98] opacity-0"
  }

  return isHighlighted
    ? "translate-x-0 scale-[1.01] border-salvia opacity-100"
    : "translate-x-0 scale-100 opacity-100"
}

export const cartItemStyles = {
  card: (isRemoving, isHighlighted) =>
    `grid gap-4 rounded-marca border border-linea bg-white p-4 shadow-tarjeta transition-all duration-200 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center ${cardState(isRemoving, isHighlighted)}`,
  imageButton: "rounded-marca focus-visible:outline-siena",
  image: "h-32 w-full rounded-marca bg-crema object-contain sm:h-28",
  info: "min-w-0",
  detailButton:
    "text-left font-display text-lg text-siena transition-colors hover:text-ink",
  description: "mt-1 line-clamp-2 text-sm leading-6 text-ink-soft",
  price: "mt-3 text-sm font-medium text-ink",
  subtotal: "mt-1 text-sm text-ink-soft",
  stock: "mt-1 text-xs text-ink-soft",
  controls: "flex items-center gap-2 sm:justify-end",
  quantityButton:
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-linea text-siena transition-all duration-150 hover:bg-alabastro active:scale-90 disabled:cursor-not-allowed disabled:opacity-40",
  quantity: "min-w-8 text-center text-sm font-medium text-ink",
  removeButton:
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-error transition-colors hover:bg-error-bg disabled:cursor-not-allowed disabled:opacity-40",
  icon: "h-4 w-4",
}

export const productCardStyles = {
  link: "group block h-full cursor-pointer no-underline",
  card: "h-full overflow-hidden rounded-marca border border-linea bg-white shadow-tarjeta transition-[transform,border-color,box-shadow,outline] duration-[180ms] ease-in-out group-hover:-translate-y-1 group-hover:border-siena group-hover:shadow-marca group-focus-visible:-translate-y-1 group-focus-visible:border-siena group-focus-visible:shadow-marca group-focus-visible:outline-none",
  media: "relative",
  image: (compact, soldOut = false) =>
    [
      "h-64 w-full bg-crema object-contain p-4",
      compact && "sm:h-52",
      soldOut && "opacity-60 grayscale-[70%]",
    ]
      .filter(Boolean)
      .join(" "),
  badge: (variant) =>
    [
      "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-cta shadow-tarjeta",
      variant === "bestSeller"
        ? "bg-oro text-ink ring-1 ring-white/60"
        : "bg-ink text-crema",
    ].join(" "),
  content: (compact) => (compact ? "px-3 pb-3 pt-2" : "p-5"),
  title: (compact) =>
    compact
      ? "font-display text-lg font-bold text-siena sm:text-xl"
      : "font-display text-2xl font-bold text-siena",
  price: "mt-2 text-lg font-semibold text-ink",
  description: "mt-3 text-sm leading-6 text-ink-soft",
  measures: "mt-4 text-sm text-ink-soft",
  optionalFields: "mt-5 space-y-2 border-t border-linea pt-4",
  optionalField: "text-sm leading-5 text-ink-soft",
}

export const productCardStyles = {
  link: "group block h-full cursor-pointer no-underline",
  card: "h-full overflow-hidden rounded-lg border border-[#A0522D]/20 bg-[#F5E6D3] shadow-md transition-[transform,border-color,box-shadow,outline] duration-[180ms] ease-in-out group-hover:-translate-y-[0.35rem] group-hover:border-[#A0522D] group-hover:shadow-[0_0.75rem_1.5rem_color-mix(in_srgb,#A0522D_12%,transparent)] group-focus-visible:-translate-y-[0.35rem] group-focus-visible:border-[#A0522D] group-focus-visible:shadow-[0_0.75rem_1.5rem_color-mix(in_srgb,#A0522D_12%,transparent)] group-focus-visible:outline-none",
  image: (compact) =>
    compact
      ? "h-64 w-full object-cover sm:h-52"
      : "h-64 w-full object-cover",
  content: (compact) => (compact ? "px-3 pb-3 pt-2" : "p-5"),
  title: (compact) =>
    compact
      ? "font-serif text-lg font-bold text-[#A0522D] sm:text-xl"
      : "font-serif text-2xl font-bold text-[#A0522D]",
  description: "mt-3 text-sm leading-6 text-gray-700",
  measures: "mt-4 text-sm text-gray-700",
  optionalFields: "mt-5 space-y-2 border-t border-[#A0522D]/20 pt-4",
  optionalField: "text-sm leading-5 text-gray-700",
}

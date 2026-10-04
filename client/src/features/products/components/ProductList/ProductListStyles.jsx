export const productListContainer = (compact) => {
  return compact
    ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";
};

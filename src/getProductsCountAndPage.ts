export const getProductsCountAndPage = (from: number, to: number): [number, number] => {
  const count = to - from + 1
  const page = Math.round((to + 1) / count)

  return [count, page]
}

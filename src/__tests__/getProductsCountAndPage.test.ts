import { getProductsCountAndPage } from '../getProductsCountAndPage'

describe('getProductsCountAndPage', () => {
  it('should convert from/to to page/count', () => {
    expect(getProductsCountAndPage(0, 9)).toStrictEqual([10, 1])
    expect(getProductsCountAndPage(10, 19)).toStrictEqual([10, 2])
    expect(getProductsCountAndPage(0, 2)).toStrictEqual([3, 1])
  })
})

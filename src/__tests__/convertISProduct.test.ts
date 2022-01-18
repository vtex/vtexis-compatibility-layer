import { convertISProduct } from '../convertISProduct'
import { biggyProductMock } from './mock/biggyProduct'
import { vtexProductMock } from './mock/vtexProduct'

let biggyProduct: BiggySearchProduct
let convertedVtexProduct: SearchProduct
let convertedSearchItems: SearchItem[]

describe('convertISProduct', () => {
  beforeAll(() => {
    biggyProduct = { ...biggyProductMock }
    convertedVtexProduct = convertISProduct(biggyProduct)
    convertedSearchItems = convertedVtexProduct.items
  })

  it('should convert brand information properly', () => {
    const { brand, brandId } = convertedVtexProduct

    expect(brand).toBe(vtexProductMock.brand)
    expect(brandId).toBe(vtexProductMock.brandId)
  })

  it('should convert category information properly', () => {
    const { categoryId, categories } = convertedVtexProduct

    expect(categoryId).toBe(vtexProductMock.categoryId)
    expect(categories).toMatchObject(vtexProductMock.categories)

    // We don't support to category tree currently
    // expect(categoryTree).toMatchObject(vtexProductMock.categoryTree)
  })

  it('should convert productClusters and clusterHighLights properly', () => {
    const { clusterHighlights, productClusters } = convertedVtexProduct

    expect(clusterHighlights).toMatchObject(vtexProductMock.clusterHighlights)
    expect(productClusters).toMatchObject(vtexProductMock.productClusters)
  })

  it('should convert description properly', () => {
    const { description } = convertedVtexProduct

    expect(description).toBe(vtexProductMock.description)
  })

  it('should convert skuSpecifications properly', () => {
    const { skuSpecifications } = convertedVtexProduct

    expect(skuSpecifications).toMatchObject(vtexProductMock.skuSpecifications)
  })

  it('should convert link information properly', () => {
    const { linkText } = convertedVtexProduct

    expect(linkText).toBe(vtexProductMock.linkText)
  })
  it('should convert productId properly', () => {
    const { productId } = convertedVtexProduct

    expect(productId).toBe(vtexProductMock.productId)
  })

  it('should convert name information properly', () => {
    const { productName } = convertedVtexProduct

    expect(productName).toBe(vtexProductMock.productName)
  })

  it('should convert productReference properly', () => {
    const { productReference } = convertedVtexProduct

    expect(productReference).toBe(vtexProductMock.productReference)
  })

  it('should convert priceRange properly', () => {
    const { priceRange } = convertedVtexProduct

    expect(priceRange).toMatchObject(vtexProductMock.priceRange)
  })

  it('should convert specifications info properly', () => {
    const { skuSpecifications, specificationGroups, properties } = convertedVtexProduct

    expect(skuSpecifications).toMatchObject(vtexProductMock.skuSpecifications)

    // FIXME: https://vtex-dev.atlassian.net/browse/PER-3403
    // vtexProductMock.specificationGroups.forEach((specification) => {
    //   expect(specificationGroups).toEqual(
    //     expect.arrayContaining([
    //       expect.objectContaining({
    //         name: specification.name,
    //         originalName: specification.originalName,
    //         specifications: expect.arrayContaining([...specification.specifications]),
    //       }),
    //     ])
    //   )
    // })

    vtexProductMock.properties.forEach((property) => {
      expect(properties).toEqual(expect.arrayContaining([property]))
    })
  })

  it('should covert items in the correct order', () => {
    expect(convertedSearchItems).toHaveLength(vtexProductMock.items.length)

    convertedSearchItems.forEach((item, idx) => {
      expect(item.itemId).toBe(vtexProductMock.items[idx].itemId)
    })
  })
})

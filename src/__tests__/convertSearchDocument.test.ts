import { searchOffersMock } from './mock/searchOffers'
import { convertSearchDocument } from '../convertSearchDocument'
import { searchDocumentMock } from './mock/searchDocument'
import { searchProductMock } from './mock/searchProduct'

let searchDocument: SkuDocument
let searchOffers: SkuOffers
let convertedVtexProduct: SearchProduct
let convertedSearchItems: SearchItem[]

describe('convertSearchDocument', () => {
  beforeAll(async () => {
    searchDocument = { ...searchDocumentMock }
    searchOffers = { ...searchOffersMock }
    convertedVtexProduct = (await convertSearchDocument([searchDocument], searchOffers, 'biggy'))[0]
    convertedSearchItems = convertedVtexProduct.items
  })

  it('should convert brand information properly', () => {
    const { brand, brandId } = convertedVtexProduct

    expect(brand).toBe(searchProductMock.brand)
    expect(brandId).toBe(searchProductMock.brandId)
  })

  it('should convert category information properly', () => {
    const { categoryId, categories } = convertedVtexProduct

    expect(categoryId).toBe(searchProductMock.categoryId)
    expect(categories).toMatchObject(searchProductMock.categories)

    // We don't support to category tree currently
    // expect(categoryTree).toMatchObject(searchProductMock.categoryTree)
  })

  it('should convert productClusters and clusterHighLights properly', () => {
    const { clusterHighlights, productClusters } = convertedVtexProduct

    expect(clusterHighlights).toMatchObject(searchProductMock.clusterHighlights)
    expect(productClusters).toMatchObject(searchProductMock.productClusters)
  })

  it('should convert description properly', () => {
    const { description } = convertedVtexProduct

    expect(description).toBe(searchProductMock.description)
  })

  it('should convert skuSpecifications properly', () => {
    const { skuSpecifications } = convertedVtexProduct

    expect(skuSpecifications).toMatchObject(searchProductMock.skuSpecifications)
  })

  it('should convert link information properly', () => {
    const { linkText } = convertedVtexProduct

    expect(linkText).toBe(searchProductMock.linkText)
  })
  it('should convert productId properly', () => {
    const { productId } = convertedVtexProduct

    expect(productId).toBe(searchProductMock.productId)
  })

  it('should convert name information properly', () => {
    const { productName } = convertedVtexProduct

    expect(productName).toBe(searchProductMock.productName)
  })

  it('should convert productReference properly', () => {
    const { productReference } = convertedVtexProduct

    expect(productReference).toBe(searchProductMock.productReference)
  })

  it('should convert priceRange properly', () => {
    const { priceRange } = convertedVtexProduct

    expect(priceRange).toMatchObject(searchProductMock.priceRange)
  })

  it('should convert specifications info properly', () => {
    const { specificationGroups, properties } = convertedVtexProduct

    // TODO: Fix skuSpecifications mapping
    // expect(skuSpecifications).toMatchObject(searchProductMock.skuSpecifications)

    searchProductMock.specificationGroups.forEach((specification) => {
      expect(specificationGroups).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: specification.name,
            originalName: specification.originalName,
            specifications: expect.arrayContaining([...specification.specifications]),
          }),
        ])
      )
    })

    searchProductMock.properties.forEach((property) => {
      expect(properties).toEqual(expect.arrayContaining([property]))
    })
  })

  it('should covert items in the correct order', () => {
    expect(convertedSearchItems).toHaveLength(searchProductMock.items.length)

    convertedSearchItems.forEach((item, idx) => {
      expect(item.itemId).toBe(searchProductMock.items[idx].itemId)
    })
  })
})

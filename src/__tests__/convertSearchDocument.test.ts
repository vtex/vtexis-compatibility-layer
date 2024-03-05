import { searchOffersMock } from './mock/searchOffers'
import { convertSearchDocument } from '../convertSearchDocument'
import { searchDocumentMock } from './mock/searchDocument'
import { searchProductMock } from './mock/searchProduct'
import { translationsMock } from './mock/documentTranslations'

let searchDocument: SkuDocument
let searchOffers: SkuOffers
let convertedVtexProduct: SearchProduct
let convertedSearchItems: SearchItem[]
let translations: TranslatedProperty[]

describe('convertSearchDocument', () => {
  beforeAll(async () => {
    searchDocument = { ...searchDocumentMock }
    searchOffers = { ...searchOffersMock }
    convertedVtexProduct = (await convertSearchDocument([searchDocument], searchOffers, 'biggy'))[0]
    convertedSearchItems = convertedVtexProduct.items
    translations = translationsMock
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
    const { specificationGroups, properties, skuSpecifications } = convertedVtexProduct

    expect(skuSpecifications).toMatchObject(searchProductMock.skuSpecifications)

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

  it('should translate product details properly', async () => {
    const [translatedProduct] = await convertSearchDocument([searchDocument], searchOffers, 'biggy', translations)
    const productName = translations.find((item) => item.field === 'ProductName')?.translation
    const description = translations.find((item) => item.field === 'Description')?.translation
    const brand = translations.find((item) => item.field === 'BrandName')?.translation

    expect(translatedProduct.productName).toEqual(productName)
    expect(translatedProduct.description).toEqual(description)
    expect(translatedProduct.brand).toEqual(brand)
  })

  it('should translate product specifications properly', async () => {
    const [translatedProduct] = await convertSearchDocument([searchDocument], searchOffers, 'biggy', translations)
    const skuSpecificationName = translations.find(
      (item) => item.field === 'SpecificationName' && item.context === '30'
    )?.translation

    const skuSpecificationValue = translations.find(
      (item) => item.field === 'SpecificationValue' && item.context === 'Roxo/Lilas'
    )?.translation

    expect(translatedProduct.skuSpecifications[0].field.name).toEqual(skuSpecificationName)
    expect(translatedProduct.skuSpecifications[0].values[0].name).toEqual(skuSpecificationValue)

    expect(translatedProduct.specificationGroups[0].name).toEqual(searchProductMock.specificationGroups[0].name)
    expect(translatedProduct.specificationGroups[0].specifications[0].name).toEqual(skuSpecificationName)
    expect(translatedProduct.specificationGroups[0].specifications[0].values).toEqual([skuSpecificationValue])
  })

  it('should translate item details properly', async () => {
    const [translatedItem] = (
      await convertSearchDocument([searchDocument], searchOffers, 'biggy', translations)
    )[0].items

    const itemName = translations.find((item) => item.field === 'SkuName' && item.context === '326782298')?.translation
    const nameComplete = `${translations.find((item) => item.field === 'ProductName')?.translation} ${
      translations.find((item) => item.field === 'SkuName' && item.context === '326782298')?.translation
    }`

    expect(translatedItem.name).toEqual(itemName)
    expect(translatedItem.nameComplete).toEqual(nameComplete)
  })

  it('should translate category names properly', async () => {
    const [translatedProduct] = await convertSearchDocument([searchDocument], searchOffers, 'biggy', translations)

    const category1 = translations.find((item) => item.field === 'CategoryName' && item.context === '14')?.translation
    const category2 = translations.find((item) => item.field === 'CategoryName' && item.context === '356')?.translation

    expect(translatedProduct.categories[1].split('/')[1]).toEqual(category1)
    expect(translatedProduct.categories[0].split('/')[2]).toEqual(category2)
  })
})

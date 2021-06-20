import convertSKU from '../convertSKU'
import { biggyProductMock } from './mock/biggyProduct'
import { vtexProductMock } from './mock/vtexProduct'

let convertedSKU: SearchItem
let originalSKU: SearchItem

describe('converSKU', () => {
  beforeAll(() => {
    convertedSKU = convertSKU(biggyProductMock, 'API', '1')(biggyProductMock.skus[1])
    originalSKU = vtexProductMock.items[1]
  })

  it('should convert itemId properly', () => {
    const { itemId } = convertedSKU

    expect(itemId).toBe(originalSKU.itemId)
  })

  it('should convert name info properly', () => {
    const { name, complementName } = convertedSKU

    expect(name).toBe(originalSKU.name)
    expect(complementName).toBe(originalSKU.complementName)
  })

  it('should convert ean properly', () => {
    const { ean } = convertedSKU

    expect(ean).toBe(originalSKU.ean)
  })

  it('should convert referenceId properly', () => {
    const { referenceId } = convertedSKU

    expect(referenceId).toMatchObject(originalSKU.referenceId)
  })

  it('should convert variations properly', () => {
    const { variations } = convertedSKU

    expect(variations).toMatchObject(originalSKU.variations)
  })

  it('should convert unit info properly', () => {
    const { unitMultiplier, measurementUnit } = convertedSKU

    expect(unitMultiplier).toBe(originalSKU.unitMultiplier)
    expect(measurementUnit).toBe(originalSKU.measurementUnit)
  })

  it('should convert images properly', () => {
    const { images } = convertedSKU

    expect(images).toHaveLength(originalSKU.images.length)

    images.forEach((image, idx) => {
      expect(image.imageId).toBe(originalSKU.images[idx].imageId)
    })
  })

  it('should convert sellers properly', () => {
    const { sellers } = convertedSKU

    expect(sellers).toHaveLength(originalSKU.sellers.length)

    sellers.forEach((seller, idx) => {
      const { sellerDefault, sellerId, sellerName, commertialOffer } = seller
      const originalSeller = originalSKU.sellers[idx]

      expect(sellerDefault).toBe(originalSeller.sellerDefault)
      expect(sellerId).toBe(originalSeller.sellerId)
      expect(sellerName).toBe(originalSeller.sellerName)

      const {
        Price,
        ListPrice,
        taxPercentage,
        Tax,
        PriceWithoutDiscount,
        RewardValue,
        spotPrice,
        teasers,
      } = commertialOffer

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(Price).toBe(originalSeller.commertialOffer.Price)
      expect(ListPrice).toBe(originalSeller.commertialOffer.ListPrice)
      expect(spotPrice).toBe(originalSeller.commertialOffer.spotPrice)
      expect(taxPercentage).toBe(originalSeller.commertialOffer.taxPercentage)
      expect(Tax).toBe(originalSeller.commertialOffer.Tax)
      expect(PriceWithoutDiscount).toBe(originalSeller.commertialOffer.PriceWithoutDiscount)
      expect(RewardValue).toBe(originalSeller.commertialOffer.RewardValue)
      expect(teasers).toMatchObject(originalSeller.commertialOffer.teasers)
    })
  })

  it('should create a default seller if it was indexed by XML', () => {
    const { sellers } = convertSKU(biggyProductMock, 'XML', '1')(biggyProductMock.skus[1])

    expect(sellers).toHaveLength(1)

    const [seller] = sellers

    expect(seller.sellerId).toBe('1')
  })
})

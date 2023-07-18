import { pathOr } from 'ramda'

export function distinct<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index
}

export const objToNameValue = (
  keyName: string,
  valueName: string,
  record: Record<string, unknown> | null | undefined
) => {
  if (!record) {
    return []
  }

  return Object.keys(record).reduce((acc, key) => {
    const value = record[key]

    if (typeof value === 'string') {
      acc.push({ [keyName]: key, [valueName]: value })
    }

    return acc
  }, [] as Array<Record<string, string>>)
}

const getMaxAndMinForAttribute = (offers: CommertialOffer[], attribute: 'Price' | 'ListPrice') => {
  return offers.reduce(
    (acc, currentOffer) => {
      const highPrice = currentOffer[attribute] > acc.highPrice ? currentOffer[attribute] : acc.highPrice
      const lowPrice =
        currentOffer[attribute] < acc.lowPrice && currentOffer[attribute] > 0 ? currentOffer[attribute] : acc.lowPrice

      return { highPrice, lowPrice }
    },
    { highPrice: 0, lowPrice: Infinity }
  )
}

export const getFirstNonNullable = <T>(arr: T[]): T | undefined => {
  return arr.find((el) => el !== null && typeof el !== 'undefined')
}

const isSellerAvailable = (seller: Seller) => pathOr(0, ['commertialOffer', 'AvailableQuantity'], seller) > 0

export const getPriceRange = (searchItems: SearchItem[]) => {
  const offers = searchItems.reduce<CommertialOffer[]>((acc, currentItem) => {
    for (const seller of currentItem.sellers) {
      if (isSellerAvailable(seller)) {
        acc.push(seller.commertialOffer)
      }
    }

    return acc
  }, [])

  return {
    sellingPrice: getMaxAndMinForAttribute(offers, 'Price'),
    listPrice: getMaxAndMinForAttribute(offers, 'ListPrice'),
  }
}

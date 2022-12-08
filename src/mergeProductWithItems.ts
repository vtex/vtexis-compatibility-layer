const mergeSellers = (sellerA: Seller, sellerB: Seller, defaultSeller?: string) => {
  if (sellerB.error) {
    return sellerA
  }

  sellerA.commertialOffer = {
    ...sellerA.commertialOffer,
    ...sellerB.commertialOffer,
    // This line is important because there are old versions of the vtex.store-graphl that returns the Tax as undefined
    // The versions are 2.158.1-hkignore.0, 2.158.0, 2.157.1 and 2.147.5-hkignore.0
    // When those versions are not receiving requests anymore, than it is safe to delete this line
    Tax: sellerB.commertialOffer.Tax ?? sellerA.commertialOffer.Tax,
  }

  // Deal with withoutPriceFulfillment cases
  if (sellerA.commertialOffer.Price === 0) {
    sellerA.commertialOffer.AvailableQuantity = 0
  }

  if (!defaultSeller) {
    return sellerA
  }

  return {
    ...sellerA,
    sellerDefault: sellerA.sellerId === defaultSeller,
  }
}

const getDefaultSeller = (sellers: Seller[]) => {
  const sellersWithStock = sellers.filter((seller) => seller.commertialOffer.AvailableQuantity !== 0)

  return sellersWithStock
    ?.sort((a, b) => a.commertialOffer.spotPrice - b.commertialOffer.spotPrice)
    .map((seller) => seller.sellerId)[0]
}

export const mergeProductWithItems = (
  product: SearchProduct,
  items: SearchItem[],
  simulationBehavior: 'default' | 'only1P'
) => {
  const mergedProduct = { ...product }

  mergedProduct.items.forEach((item: SearchItem, itemIndex) => {
    const simulationItem = items[itemIndex]

    if (simulationBehavior === 'default') {
      const defaultSeller = getDefaultSeller(simulationItem.sellers)

      item.sellers = item.sellers.map((seller: any, simulationIndex: any) => {
        const sellerSimulation = simulationItem.sellers[simulationIndex]

        return mergeSellers(seller, sellerSimulation, defaultSeller)
      })
    } else {
      const seller1PIndex = item.sellers.findIndex((seller) => seller.sellerId === '1')
      const sellers = Array.from(item.sellers)

      sellers[seller1PIndex] = simulationItem.sellers[0]
      const sellerDefault = getDefaultSeller(sellers)

      item.sellers = item.sellers.map((seller) => {
        if (seller.sellerId !== '1') {
          return !sellerDefault
            ? seller
            : {
                ...seller,
                sellerDefault: seller.sellerId === sellerDefault,
              }
        }

        return mergeSellers(seller, simulationItem.sellers[0], sellerDefault)
      })
    }
  })

  return mergedProduct
}

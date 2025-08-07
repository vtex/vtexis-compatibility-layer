const mergeSellers = (sellerA: Seller, sellerB: Seller, ignoreSimulationQuantity?: boolean) => {
  if (sellerB.error) {
    return sellerA
  }

  if (ignoreSimulationQuantity) {
    sellerB.commertialOffer.AvailableQuantity = sellerA.commertialOffer.AvailableQuantity
  }

  sellerA.commertialOffer = {
    ...sellerA.commertialOffer,
    ...sellerB.commertialOffer,
    // This line is important because there are old versions of the vtex.store-graphl that returns the Tax as undefined
    // The versions are 2.158.1-hkignore.0, 2.158.0, 2.157.1 and 2.147.5-hkignore.0
    // When those versions are not receiving requests anymore, than it is safe to delete this line
    Tax: sellerB.commertialOffer.Tax ?? sellerA.commertialOffer.Tax,
  }

  return sellerA

}

export const mergeProductWithItems = (
  product: SearchProduct,
  items: SearchItem[],
  simulationBehavior: 'default' | 'only1P' | 'regionalize1p' | 'only3P',
  ignoreSimulationQuantity: boolean = false
) => {
  const mergedProduct = { ...product }

  mergedProduct.items.forEach((item: SearchItem, itemIndex) => {
    const simulationItem = items[itemIndex]

    if (simulationBehavior !== 'only1P') {
      item.sellers = item.sellers.map((seller: any, simulationIndex: any) => {
        // Ignore seller 1 simulation if only3P
        if (simulationBehavior === 'only3P' && seller.sellerId === '1') {
          return seller
        }

        const sellerSimulation = simulationItem.sellers[simulationIndex]

        return mergeSellers(seller, sellerSimulation, ignoreSimulationQuantity)
      })
    } else {
      const seller1PIndex = item.sellers.findIndex((seller) => seller.sellerId === '1')
      const sellers = Array.from(item.sellers)

      sellers[seller1PIndex] = simulationItem.sellers[0]

      item.sellers = item.sellers.map((seller) => {
        if (seller.sellerId !== '1') {
          return seller
        }

        return mergeSellers(seller, simulationItem.sellers[0], ignoreSimulationQuantity)
      })
    }
  })

  return mergedProduct
}

const mergeSellers = (sellerA: Seller, sellerB: Seller) => {
  sellerA.commertialOffer = {
    ...sellerA.commertialOffer,
    ...sellerB.commertialOffer,
  }

  // Deal with withoutPriceFulfillment cases
  if (sellerA.commertialOffer.Price === 0) {
    sellerA.commertialOffer.AvailableQuantity = 0
  }

  return sellerA
}

export const mergeProductWithItems = (product: SearchProduct, items: SearchItem[]) => {
  const mergedProduct = { ...product }

  mergedProduct.items.forEach((item: any, itemIndex: any) => {
    const simulationItem = items[itemIndex]

    item.sellers = item.sellers.map((seller: any, simulationIndex: any) => {
      const sellerSimulation = simulationItem.sellers[simulationIndex]

      return mergeSellers(seller, sellerSimulation)
    })
  })

  return mergedProduct
}

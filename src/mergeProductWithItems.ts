const mergeSellers = (sellerA: Seller, sellerB: Seller, defaultSeller?: string) => {
  sellerA.commertialOffer = {
    ...sellerA.commertialOffer,
    ...sellerB.commertialOffer,
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
  const sellersWithStock = sellers
    .filter(seller => seller.commertialOffer.AvailableQuantity !== 0)

  return sellersWithStock?.sort((a,b) => a.commertialOffer.Price - b.commertialOffer.Price)
    .map(seller => seller.sellerId)[0]
}

export const mergeProductWithItems = (product: SearchProduct, items: SearchItem[]) => {
  const mergedProduct = { ...product }

  mergedProduct.items.forEach((item: any, itemIndex: any) => {
    const simulationItem = items[itemIndex]
    const defaultSeller = getDefaultSeller(simulationItem.sellers)

    item.sellers = item.sellers.map((seller: any, simulationIndex: any) => {
      const sellerSimulation = simulationItem.sellers[simulationIndex]

      return mergeSellers(seller, sellerSimulation, defaultSeller)
    })
  })

  return mergedProduct
}

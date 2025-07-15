import { mergeProductWithItems } from '../mergeProductWithItems'
import { itemsWithSimulationResponseMock } from './mock/itemsWithSimulationResponse'
import { itemsWithSimulationResponse3PMock } from './mock/itemsWithSimulationResponse3P'
import { vtexProductMock } from './mock/vtexProduct'
import { vtexProduct3PMock } from './mock/vtexProduct3P'

describe('mergeProductWithItems', () => {
  it('should be able to merge the results from the itemsWithSimulation query', () => {
    const mergedProduct = mergeProductWithItems(vtexProductMock, itemsWithSimulationResponseMock, 'default')

    const [mergedItem] = mergedProduct.items
    const [mergedSeller] = mergedItem.sellers
    const [sellerFromSimulation] = itemsWithSimulationResponseMock[0].sellers

    expect(mergedSeller.commertialOffer).toMatchObject(sellerFromSimulation.commertialOffer)
  })

  it('should be able to ignore simulation quantity', () => {
    const mergedProduct = mergeProductWithItems(vtexProductMock, itemsWithSimulationResponseMock, 'default', true)

    // Set the mock to 0, as the simulation quantity is 10000.
    vtexProductMock.items[0].sellers[0].commertialOffer.AvailableQuantity = 0

    const [mergedItem] = mergedProduct.items
    const [mergedSeller] = mergedItem.sellers
    const [sellerFromSimulation] = itemsWithSimulationResponseMock[0].sellers

    expect(mergedSeller.commertialOffer).not.toMatchObject(sellerFromSimulation.commertialOffer)
    expect(mergedSeller.commertialOffer.AvailableQuantity).toEqual(
      vtexProductMock.items[0].sellers[0].commertialOffer.AvailableQuantity
    )
  })

  it('should ignore simulation seller 1 if simulationBehavior only3P', () => {
    const mergedProduct = mergeProductWithItems(vtexProduct3PMock, itemsWithSimulationResponse3PMock, 'only3P')

    const seller1 = vtexProduct3PMock.items[0].sellers[0]

    const [mergedItem] = mergedProduct.items
    const mergedSellers = mergedItem.sellers
    const seller1Merged = mergedSellers.find((seller) => seller.sellerId === '1')
    const seller3PMerged = mergedSellers.find((seller) => seller.sellerId === 'seller3P')

    expect(seller1Merged?.commertialOffer.spotPrice).toBe(375.77)
    expect(seller3PMerged?.commertialOffer.spotPrice).toBe(223375.77)
  })
})

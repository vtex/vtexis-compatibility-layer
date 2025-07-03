import { mergeProductWithItems } from '../mergeProductWithItems'
import { itemsWithSimulationResponseMock } from './mock/itemsWithSimulationResponse'
import { vtexProductMock } from './mock/vtexProduct'

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
})

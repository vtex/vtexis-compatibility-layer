import { getFirstNonNullable } from './utils'

const getVariations = (sku: BiggySearchSKU, product: BiggySearchProduct): Variation[] => {
  return sku.attributes.map((attribute) => {
    const translatedAttribute = product.textAttributes.find(({ joinedKey, joinedValue }) => {
      return joinedKey.split('@@@')[2] === attribute.key && joinedValue.split('@@@')[1] === attribute.value
    })

    if (!translatedAttribute) {
      return { name: attribute.key, values: [attribute.value] }
    }

    return {
      name: translatedAttribute.labelKey,
      values: [translatedAttribute.labelValue],
    }
  })
}

const buildCommertialOffer = (
  price: number,
  oldPrice: number,
  spotPrice: number,
  stock: number,
  teasers: Teaser[],
  installment?: BiggyInstallment,
  tax?: number
): CommertialOffer => {
  const installments: SearchInstallment[] = installment
    ? [
        {
          Value: installment.value,
          InterestRate: 0,
          TotalValuePlusInterestRate: price,
          NumberOfInstallments: installment.count,
          Name: '',
          PaymentSystemName: '',
          PaymentSystemGroupName: '',
        },
      ]
    : []

  const availableQuantity = stock && stock > 0 ? 10000 : 0

  return {
    DeliverySlaSamplesPerRegion: {},
    DeliverySlaSamples: [],
    AvailableQuantity: availableQuantity,
    discountHighlights: [],
    Installments: installments,
    Price: price,
    ListPrice: oldPrice,
    spotPrice,
    taxPercentage: (tax ?? 0) / price,
    PriceWithoutDiscount: oldPrice,
    Tax: tax ?? 0,
    GiftSkuIds: [],
    BuyTogether: [],
    ItemMetadataAttachment: [],
    RewardValue: 0,
    PriceValidUntil: '',
    GetInfoErrorMessage: null,
    CacheVersionUsedToCallCheckout: '',
    teasers,
  }
}

const getSellersIndexedByApi = (product: BiggySearchProduct, sku: BiggySearchSKU, tradePolicy?: string): Seller[] => {
  const selectedPolicy = tradePolicy
    ? sku.policies.find((policy: BiggyPolicy) => policy.id === tradePolicy)
    : sku.policies[0]

  const biggySellers = selectedPolicy?.sellers ?? []

  return biggySellers.map(
    (seller: BiggySeller): Seller => {
      const price = getFirstNonNullable<number | undefined>([seller.price, sku.price, product.price]) ?? 0
      const oldPrice = getFirstNonNullable<number | undefined>([seller.oldPrice, sku.oldPrice, product.oldPrice]) ?? 0
      // if spot price does not exist, it means that there is no spot price promotion, aka spotPrice == price
      const spotPrice =
        getFirstNonNullable<number | undefined>([seller.spotPrice, sku.spotPrice, product.spotPrice]) ?? price

      const installment = seller.installment ?? product.installment

      const stock = getFirstNonNullable<number | undefined>([seller.stock, sku.stock, product.stock]) ?? 0
      const teasers = seller.teasers ?? []

      const commertialOffer = buildCommertialOffer(price, oldPrice, spotPrice, stock, teasers, installment, seller.tax)

      return {
        sellerId: seller.id,
        sellerName: seller.name,
        addToCartLink: '',
        sellerDefault: seller.default ?? false,
        commertialOffer,
      }
    }
  )
}

const getSellersIndexedByXML = (product: BiggySearchProduct): Seller[] => {
  const { price, oldPrice, installment, stock } = product
  // if spot price does not exist, it means that there is no spot price promotion, aka spotPrice == price
  const spotPrice = product.spotPrice ?? price

  const commertialOffer = buildCommertialOffer(price, oldPrice, spotPrice, stock, [], installment, product.tax)

  return [
    {
      sellerId: '1',
      sellerName: '',
      addToCartLink: '',
      sellerDefault: false,
      commertialOffer,
    },
  ]
}

const toVtexAssets = (image: string) => image.replace('vteximg.com.br', 'vtexassets.com').replace('http://', 'https://')

const elasticImageToSearchImage = (image: BiggyProductImage, imageId: string): SearchImage => {
  return {
    imageId,
    cacheId: imageId,
    imageTag: '',
    imageLabel: image.name ?? '',
    imageText: image.name ?? '',
    imageUrl: toVtexAssets(image.value),
  }
}

const getImageId = (imageUrl: string) => {
  const baseUrlRegex = new RegExp(/.+ids\/(\d+)/)

  return baseUrlRegex.test(imageUrl) ? baseUrlRegex.exec(imageUrl)?.[1] : undefined
}

const convertImages = (images: BiggyProductImage[], indexingType?: IndexingType) => {
  const vtexImages: SearchImage[] = []

  if (indexingType && indexingType === 'XML') {
    const [selectedImage] = images
    const imageId = getImageId(selectedImage.value)

    return imageId ? [elasticImageToSearchImage(selectedImage, imageId)] : []
  }

  images.forEach((image) => {
    const imageId = getImageId(image.value)

    imageId ? vtexImages.push(elasticImageToSearchImage(image, imageId)) : []
  })

  return vtexImages
}

const convertSKU = (product: BiggySearchProduct, indexingType?: IndexingType, tradePolicy?: string) => (
  sku: BiggySearchSKU
): SearchItem & { [key: string]: any } => {
  const images = convertImages(sku.images ?? product.images, indexingType)

  const sellers =
    indexingType === 'XML' ? getSellersIndexedByXML(product) : getSellersIndexedByApi(product, sku, tradePolicy)

  const variations = getVariations(sku, product)

  const item: SearchItem & { [key: string]: any } = {
    sellers,
    images,
    itemId: sku.id,
    name: sku.name,
    nameComplete: sku.nameComplete,
    complementName: sku.complementName ?? '',
    referenceId: [
      {
        Key: 'RefId',
        Value: sku.reference,
      },
    ],
    measurementUnit: sku.measurementUnit ?? product.measurementUnit,
    unitMultiplier: sku.unitMultiplier ?? product.unitMultiplier,
    variations,
    ean: sku.ean ?? '',
    modalType: '',
    videos: sku.videos ?? [],
    attachments: [],
    isKit: false,
  }

  variations.forEach((variation) => {
    item[variation.name] = variation.values ?? []
  })

  return item
}

export default convertSKU

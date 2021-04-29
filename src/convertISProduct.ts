import { distinct, objToNameValue } from './utils/object'

export enum IndexingType {
  API = 'API',
  XML = 'XML',
}

export const convertISProduct = (product: BiggySearchProduct, tradePolicy?: string, indexingType?: IndexingType) => {
  const categories: string[] = []
  const categoriesIds: string[] = []

  product.categoryTrees?.forEach((categoryTree) => {
    categories.push(`/${categoryTree.categoryNames.join('/')}/`)
    categoriesIds.push(`/${categoryTree.categoryIds.join('/')}/`)
  })

  const skus: SearchItem[] = (product.skus || []).map(convertSKU(product, indexingType, tradePolicy))

  const allSpecifications = (product.productSpecifications ?? []).concat(getSKUSpecifications(product))

  const specificationGroups = product.specificationGroups ? JSON.parse(product.specificationGroups) : {}

  const allSpecificationsGroups = [...Object.keys(specificationGroups)]

  const brandId = product.brandId ? Number(product.brandId) : -1

  const selectedProperties = product.split && [
    {
      key: product.split.labelKey,
      value: product.split.labelValue,
    },
  ]

  const specificationAttributes = product.textAttributes?.filter((attribute) => attribute.isSku) ?? []

  const specificationsByKey = specificationAttributes.reduce(
    (specsByKey: { [key: string]: BiggyTextAttribute[] }, spec) => {
      // the joinedKey has the format text@@@key@@@labelKey@@@originalKey@@@originalLabelKey
      const value = spec.joinedKey.split('@@@')[3]
      specsByKey[value] = (specsByKey[value] || []).concat(spec)

      return specsByKey
    },
    {}
  )

  const specKeys = Object.keys(specificationsByKey)

  const skuSpecifications = specKeys.map((key) => {
    const originalFieldName = specificationsByKey[key][0].joinedKey.split('@@@')[4]

    return {
      field: {
        name: specificationsByKey[key][0].labelKey,
        originalName: originalFieldName,
      },
      values: specificationsByKey[key].map((specification) => {
        return {
          name: specification.labelValue,
          originalName: specification.joinedValue.split('@@@')[1],
        }
      }),
    }
  })

  const numberAttributes = product.numberAttributes ?? []

  const numberSpecificationsByKey = numberAttributes.reduce(
    (specsByKey: { [key: string]: BiggyTextAttribute[] }, spec) => {
      const value = spec.labelKey
      specsByKey[value] = (specsByKey[value] || []).concat(spec)

      return specsByKey
    },
    {}
  )

  const numberSpecKeys = Object.keys(numberSpecificationsByKey)

  const skuNumberSpecifications = numberSpecKeys
    .map((key) => {
      const originalFieldName = numberSpecificationsByKey[key][0].labelKey

      const values = numberSpecificationsByKey[key].map((specification) => {
        return {
          name: specification.value.toString(),
          originalName: specification.value.toString(),
        }
      })

      values.sort((x, y) => Number(x.name) - Number(y.name))

      return {
        field: {
          name: originalFieldName.toString(),
          originalName: originalFieldName.toString(),
        },
        values,
      }
    })
    .filter((specification) => allSpecifications.includes(specification.field.name))

  const allSkuSpecification = skuSpecifications.concat(skuNumberSpecifications)

  const convertedProduct: SearchProduct & {
    cacheId?: string
    [key: string]: any
  } = {
    categories,
    categoriesIds,
    productId: product.id,
    cacheId: `sp-${product.id}`,
    productName: product.name,
    productReference: product.reference || product.product || product.id,
    linkText: product.link,
    brand: product.brand || '',
    brandId,
    link: product.url,
    description: product.description,
    items: skus,
    allSpecifications,
    categoryId: product.categoryIds?.slice(-1)[0],
    productTitle: '',
    metaTagDescription: '',
    clusterHighlights: objToNameValue('id', 'name', product.clusterHighlights),
    productClusters: [],
    searchableClusters: {},
    titleTag: '',
    Specifications: [],
    allSpecificationsGroups,
    itemMetadata: {
      items: [],
    },
    selectedProperties,
    skuSpecifications: allSkuSpecification,
    // This field is only maintained for backwards compatibility reasons, it shouldn't exist.
    skus: skus.find((sku) => sku.sellers && sku.sellers.length > 0),
    properties: getProperties(specificationGroups),
    specificationGroups
  }

  if (product.extraData) {
    product.extraData.forEach(({ key, value }: BiggyProductExtraData) => {
      convertedProduct.allSpecifications?.push(key)
      convertedProduct[key] = [value]
    })
  }

  if (product.textAttributes) {
    allSpecifications.forEach((specification) => {
      if (!convertedProduct[specification]) {
        const attributes = product.textAttributes.filter((attribute) => attribute.labelKey == specification)
        convertedProduct[specification] = attributes.map((attribute) => {
          return attribute.labelValue
        })
      }
    })

    product.textAttributes
      .filter((attribute) => attribute.labelKey === 'productClusterNames')
      .forEach((attribute) => {
        if (attribute.valueId) {
          convertedProduct.productClusters.push({ id: attribute.valueId, name: attribute.labelValue })
        }
      })
  }

  allSpecificationsGroups.forEach((specificationGroup) => {
    convertedProduct[specificationGroup] =
      convertedProduct[specificationGroup] ?? specificationGroups[specificationGroup]
  })

  return convertedProduct
}

const getVariations = (sku: BiggySearchSKU): string[] => {
  return sku.attributes.map((attribute) => attribute.key)
}

const getSKUSpecifications = (product: BiggySearchProduct): string[] => {
  return product.skus
    .map((sku) => sku.attributes.map((attribute) => attribute.key))
    .reduce((acc, val) => acc.concat(val), [])
    .filter(distinct)
}

const buildCommertialOffer = (
  price: number,
  oldPrice: number,
  stock: number,
  teasers: object[],
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
    DiscountHighLight: [],
    Teasers: teasers,
    Installments: installments,
    Price: price,
    ListPrice: oldPrice,
    spotPrice: getSpotPrice(price, installments),
    taxPercentage: (tax || 0) / price,
    PriceWithoutDiscount: oldPrice,
    Tax: tax || 0,
    GiftSkuIds: [],
    BuyTogether: [],
    ItemMetadataAttachment: [],
    RewardValue: 0,
    PriceValidUntil: '',
    GetInfoErrorMessage: null,
    CacheVersionUsedToCallCheckout: '',
  }
}

const getSellersIndexedByApi = (product: BiggySearchProduct, sku: BiggySearchSKU, tradePolicy?: string): Seller[] => {
  const selectedPolicy = tradePolicy
    ? sku.policies.find((policy: BiggyPolicy) => policy.id === tradePolicy)
    : sku.policies[0]

  const biggySellers = (selectedPolicy && selectedPolicy.sellers) || []

  return biggySellers.map(
    (seller: BiggySeller): Seller => {
      const price = seller.price || sku.price || product.price
      const oldPrice = seller.oldPrice || sku.oldPrice || product.oldPrice
      const installment = seller.installment || product.installment

      const stock = seller.stock || sku.stock || product.stock
      const teasers = seller.teasers ?? []

      const commertialOffer = buildCommertialOffer(price, oldPrice, stock, teasers, installment, seller.tax)

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
  const price = product.price
  const oldPrice = product.oldPrice
  const installment = product.installment

  const stock = product.stock

  const commertialOffer = buildCommertialOffer(price, oldPrice, stock, [], installment, product.tax)

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

const getImageId = (imageUrl: string) => {
  const baseUrlRegex = new RegExp(/.+ids\/(\d+)/)
  return baseUrlRegex.test(imageUrl) ? baseUrlRegex.exec(imageUrl)![1] : undefined
}

const elasticImageToSearchImage = (image: ElasticImage, imageId: string): SearchImage => {
  return {
    imageId,
    imageTag: '',
    imageLabel: image.name,
    imageText: image.name,
    imageUrl: image.value,
  }
}

const convertImages = (images: ElasticImage[], indexingType?: IndexingType) => {
  const vtexImages: SearchImage[] = []

  if (indexingType && indexingType === IndexingType.XML) {
    const selectedImage: ElasticImage = images[0]
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
    indexingType === IndexingType.XML
      ? getSellersIndexedByXML(product)
      : getSellersIndexedByApi(product, sku, tradePolicy)

  const variations = getVariations(sku)

  const item: SearchItem & { [key: string]: any } = {
    sellers,
    images,
    itemId: sku.id,
    name: sku.name,
    nameComplete: sku.nameComplete,
    complementName: product.name,
    referenceId: [
      {
        Key: 'RefId',
        Value: sku.reference,
      },
    ],
    measurementUnit: sku.measurementUnit || product.measurementUnit,
    unitMultiplier: sku.unitMultiplier || product.unitMultiplier,
    variations,
    ean: sku.ean ?? '',
    modalType: '',
    Videos: sku.videos ?? [],
    attachments: [],
    isKit: false,
  }

  variations.forEach((variation) => {
    const attribute = sku.attributes.find((attribute) => attribute.key == variation)
    item[variation] = attribute != null ? [attribute.value] : []
  })

  return item
}

const getSpotPrice = (sellingPrice: number, installments: SearchInstallment[]) => {
  const spotPrice: number | undefined = installments.find(({ NumberOfInstallments, Value }: any) => {
    return NumberOfInstallments === 1 && Value < sellingPrice
  })?.Value
  return spotPrice ?? sellingPrice
}

const getProperties = (specificationGroups: Record<string, string[]>) =>
  Object.keys(specificationGroups).map((name) => ({
    name,
    originalName: name,
    values: specificationGroups[name],
  }))

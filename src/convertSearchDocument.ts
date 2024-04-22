import { dateToTicks, getPriceRange, getTranslationInfo, objToNameValue } from './utils'

const searchableClustersFromDocument = (
  ProductClusterNames: Record<string, string>,
  ProductClusterSearchableIds: number[]
) => {
  const searchableClusters: Record<string, string> = {}

  ProductClusterSearchableIds.forEach((cluster) => {
    searchableClusters[cluster.toString()] = ProductClusterNames[cluster.toString()]
  })

  return searchableClusters
}

const categoriesFromDocument = (
  CategoriesFullPath: string[],
  CategoriesName: Record<string, string>,
  translations?: TranslatedProperty[]
) => {
  const categories: string[] = []

  CategoriesFullPath.forEach((path) => {
    let categoryPath = '/'
    const ids = path.split('/').filter((value) => value)

    ids.forEach((id) => {
      const translatedName = getTranslationInfo('CategoryName', translations, id) ?? CategoriesName[id]

      categoryPath = categoryPath.concat(`${translatedName}/`)
    })

    categories.push(categoryPath)
  })

  return categories
}

/**
 * Convert SKU Document Images to SearchImage format,
 * keeping the main image at the beginning of the array
 * */
const convertDocumentImages = (images: SkuDocumentImage[], account: string): SearchImage[] => {
  const searchImages: SearchImage[] = []

  images.forEach((image) => {
    const ticks = dateToTicks(image.LastModified)
    const img = {
      imageId: image.ImageId,
      cacheId: image.ImageId,
      imageLabel: image.ImageLabel,
      imageText: image.ImageText,
      imageTag: image.ImageTag,
      imageUrl: image.ImagePath.replace('~', `https://${account}.vtexassets.com`)
        .replace(/(-#width#)|(-#height#)/g, '')
        .concat(`?v=${ticks}`),
    }

    image.IsMain ? searchImages.unshift(img) : searchImages.push(img)
  })

  return searchImages
}

interface SpecificationInfo {
  specificationGroups: SpecificationGroup[]
  properties: ProductProperty[]
  [key: string]: any
}

const specificationsInfoFromDocument = (
  SpecificationGroups: SkuDocumentSpecificationGroup[],
  translations?: TranslatedProperty[]
): SpecificationInfo => {
  const specificationsInfo: Record<string, any> = {}
  const specificationGroups: SpecificationGroup[] = []
  const properties: ProductProperty[] = []

  SpecificationGroups.forEach((group) => {
    const groupSpecs = group.Specifications.filter(
      (specification) => specification.SpecificationValues.filter((spec) => spec.Value).length
    ).map((specification) => ({
      ...specification,
      SpecificationValues: specification.SpecificationValues.filter((spec) => spec.Value),
    }))

    if (!groupSpecs.length) {
      return
    }

    groupSpecs.forEach(({ Name, SpecificationValues }) => {
      specificationsInfo[Name] = SpecificationValues.map((value) => value.Value)
    })

    groupSpecs
      .filter((specification) => !specification.Field?.IsStockKeppingUnit)
      .map((specification) => ({
        name: getTranslationInfo('SpecificationName', translations, specification.FieldId) ?? specification.Name,
        originalName: specification.Name,
        values: specification.SpecificationValues.map(
          (spec) => getTranslationInfo('SpecificationValue', translations, spec.Id) ?? spec.Value
        ),
      }))
      .forEach((spec) => properties.push(spec))

    const visibleSpecs = groupSpecs.filter((spec) => spec.IsOnProductDetails && !spec.Field?.IsStockKeppingUnit)

    if (visibleSpecs.length) {
      specificationGroups.push({
        name: group.GroupName,
        originalName: group.GroupName,
        specifications: visibleSpecs.map((specification) => ({
          name: getTranslationInfo('SpecificationName', translations, specification.FieldId) ?? specification.Name,
          originalName: specification.Name,
          values: specification.SpecificationValues.map(
            (spec) => getTranslationInfo('SpecificationValue', translations, spec.Id) ?? spec.Value
          ),
        })),
      })
    }

    specificationsInfo[group.GroupName] = groupSpecs.map((spec) => spec.Name)
  })

  const allSpecifications = specificationGroups.flatMap((specGroup) => specGroup.specifications)

  specificationGroups.push({
    name: 'allSpecifications',
    originalName: 'allSpecifications',
    specifications: allSpecifications,
  })

  return {
    ...specificationsInfo,
    specificationGroups,
    properties,
  }
}

const skuSpecificationsFromDocuments = (
  allSpecGroups: SkuDocumentSpecificationGroup[][],
  translations?: TranslatedProperty[]
) => {
  const skuSpecs: SkuDocumentSpecification[] = []
  const groupedSpecs: Record<string, { Name: string; SpecificationValues: SkuDocumentSpecificationValue[] }> = {}

  allSpecGroups.flat().forEach((specGroup) => {
    const skuSpecsFromGroup = specGroup.Specifications.filter((spec) => spec.Field?.IsStockKeppingUnit)

    if (skuSpecsFromGroup.length) {
      skuSpecs.push(...skuSpecsFromGroup)
    }
  })

  skuSpecs.forEach((specification) => {
    if (!specification.SpecificationValues.length) {
      return
    }

    const currentSpecValues = groupedSpecs[specification.FieldId]?.SpecificationValues ?? []

    const newSpecValues = specification.SpecificationValues.filter((specValue) => {
      return currentSpecValues.findIndex((item) => item.Id === specValue.Id) === -1
    })

    groupedSpecs[specification.FieldId] = {
      Name: specification.Name,
      SpecificationValues: currentSpecValues.concat(newSpecValues),
    }
  })

  return Object.keys(groupedSpecs).map((key) => {
    const item = groupedSpecs[key]

    return {
      field: {
        name: getTranslationInfo('SpecificationName', translations, key) ?? item.Name,
        originalName: item.Name,
      },
      values: item.SpecificationValues.map((value) => ({
        name: getTranslationInfo('SpecificationValue', translations, value.Id) ?? value.Value,
        originalName: value.Value,
      })),
    }
  })
}

const getSpotPrice = (paymentOptions: PaymentOptions | null, priceWithoutDiscount: number) => {
  const installments = paymentOptions?.InstallmentOptions.flatMap((option) => option.Installments)
  const installment = installments?.find(
    (inst) => inst.Count && inst.ValueAsInt && inst.ValueAsInt / 100 < priceWithoutDiscount
  )

  return installment ? installment.ValueAsInt / 100 : priceWithoutDiscount
}

const buildInstallments = (paymentOptions: PaymentOptions | null, unitMultiplier: number): SearchInstallment[] => {
  const installments: SearchInstallment[] = []

  paymentOptions?.InstallmentOptions.forEach((option) => {
    option.Installments.forEach((installment) => {
      installments.push({
        NumberOfInstallments: installment.Count,
        Name: '',
        Value: installment.ValueAsInt / 100 / unitMultiplier,
        InterestRate: installment.InterestRateAsInt,
        PaymentSystemName: option.PaymentName,
        PaymentSystemGroupName: option.PaymentGroupName,
        TotalValuePlusInterestRate: (installment.ValueAsInt / 100 / unitMultiplier) * installment.Count,
      })
    })
  })

  return installments
}

const buildTeasers = (rnbData: RatesAndBenefitsData): Teaser[] => {
  return rnbData.Teaser.map((teaser) => {
    const conditions: TeaserCondition = {
      parameters: teaser.TeaserCondition.ConditionParameters.map((parameter) => ({
        name: parameter.Name,
        value: parameter.Value,
      })),
      minimumQuantity: teaser.TeaserCondition.MinimumQuantity,
    }

    const effects: TeaserEffects = {
      parameters: teaser.TeaserEffect.EffectParameters.map((parameter) => ({
        name: parameter.Name,
        value: parameter.Value,
      })),
    }

    // check return when values are undefined
    return {
      name: teaser.Name,
      featured: teaser.Featured,
      id: teaser.Id,
      teaserType: teaser.TeaserType,
      conditions,
      effects,
    }
  })
}

const buildCommercialOffer = (skuDocumentOffer: SalesChannelOffer, unitMultiplier: number): CommertialOffer => {
  return {
    Price: skuDocumentOffer.Price,
    ListPrice: skuDocumentOffer.ListPrice,
    PriceWithoutDiscount: skuDocumentOffer.PriceWithoutDiscount,
    Tax: skuDocumentOffer.Tax ?? 0,
    taxPercentage: (skuDocumentOffer.Tax ?? 0) / skuDocumentOffer.Price,
    RewardValue: skuDocumentOffer.RewardValue,
    PriceValidUntil: skuDocumentOffer.PriceValidUntil,
    CacheVersionUsedToCallCheckout: skuDocumentOffer.CacheVersionUsedToCallCheckout,
    spotPrice: getSpotPrice(skuDocumentOffer.PaymentOptions, skuDocumentOffer.PriceWithoutDiscount),
    AvailableQuantity: skuDocumentOffer.AvailableQuantity,
    teasers: skuDocumentOffer.RatesAndBenefitsData ? buildTeasers(skuDocumentOffer.RatesAndBenefitsData) : [],
    Installments: buildInstallments(skuDocumentOffer.PaymentOptions, unitMultiplier),
    GiftSkuIds: [],
    BuyTogether: [],
    DeliverySlaSamples: skuDocumentOffer.AvailableQuantity
      ? [
          {
            DeliverySlaPerTypes: [],
            Region: null,
          },
        ]
      : [],
    ItemMetadataAttachment: [],
  }
}

/**
 * Define which seller should be the default, which should be the
 * seller that has availability and the lowest price
 * */
const setDefaultSeller = (sellers: Array<Seller & { active: boolean }>): Seller[] => {
  const availableSellers = sellers.filter(
    (seller) =>
      seller.active && seller.commertialOffer.AvailableQuantity > 0 && seller.commertialOffer.PriceWithoutDiscount > 0
  )

  const [defaultSeller] = availableSellers.sort((a, b) => (a.commertialOffer.Price > b.commertialOffer.Price ? 1 : -1))

  const sellersWithDefault = sellers.map((seller) => {
    return {
      sellerId: seller.sellerId,
      sellerDefault: defaultSeller ? seller.sellerId === defaultSeller.sellerId : seller.sellerId === '1',
      sellerName: seller.sellerName,
      addToCartLink: seller.addToCartLink,
      commertialOffer: seller.commertialOffer,
    }
  })

  return sellersWithDefault.sort((sellerA) => (sellerA.sellerDefault ? -1 : 1))
}

const getSkuSellers = (offer: SkuOfferDetails, unitMultiplier: number) => {
  const [salesChannel] = Object.keys(offer.SkuCommercialOfferPerSalesChannel)

  const seller1: (Seller & { active: boolean }) | null = offer.Seller1
    ? {
        active: true,
        sellerId: offer.Seller1.SellerId,
        sellerName: offer.Seller1.Name,
        sellerDefault: false,
        addToCartLink: '', // fix
        commertialOffer: buildCommercialOffer(offer.SkuCommercialOfferPerSalesChannel[salesChannel], unitMultiplier),
      }
    : null

  const otherSellers: Array<Seller & { active: boolean }> = offer.SkuSellers.filter((seller) =>
    seller.AvailableSalesChannels.includes(Number(salesChannel))
  ).map((seller) => {
    return {
      active: seller.IsActive,
      sellerId: seller.SellerId,
      sellerName: seller.SellerName,
      sellerDefault: false,
      addToCartLink: '', // fix
      commertialOffer: buildCommercialOffer(seller.SkuCommercialOffer, unitMultiplier),
    }
  })

  return setDefaultSeller((seller1 ? [seller1] : []).concat(otherSellers))
}

const getSkuSubscriptions = (agregatedAttachments: SkuDocumentAttachment[]) =>
  agregatedAttachments.filter((attachment) => attachment.Name.includes('vtex.subscription.') && attachment.IsActive)

const getSkuVariations = (
  specificationGroups: SkuDocumentSpecificationGroup[],
  attachments: SkuDocumentAttachment[],
  translations?: TranslatedProperty[]
) => {
  const attributes: Array<{
    key: string
    value: string
  }> = []

  specificationGroups.forEach((group) => {
    const filteredSpecs = group.Specifications.filter(
      (specification) =>
        specification.SpecificationValues.filter((spec) => spec.Value).length && specification.Field?.IsStockKeppingUnit
    ).map((specification) => ({
      ...specification,
      SpecificationValues: specification.SpecificationValues.filter((spec) => spec.Value),
    }))

    filteredSpecs.forEach((spec) => {
      spec.SpecificationValues.forEach((value) => {
        attributes.push({
          key: getTranslationInfo('SpecificationName', translations, spec.Field!.Id.toString()) ?? spec.Field!.Name,
          value: getTranslationInfo('SpecificationValue', translations, value.Id) ?? value.Value,
        })
      })
    })
  })

  const subscriptions = getSkuSubscriptions(attachments).map((subscription) => ({
    key: 'activeSubscriptions',
    value: subscription.Name.replace('vtex.subscription.', ''),
  }))

  const variations = attributes.concat(subscriptions).map((attr) => ({
    name: attr.key,
    values: [attr.value],
  }))

  return variations
}

const getAttachments = (attachments: SkuDocumentAttachment[]): SearchAttachment[] => {
  return attachments.map((attachment) => ({
    id: attachment.Id,
    name: attachment.Name,
    domainValues: attachment.DomainValues,
    required: attachment.IsRequired,
  }))
}

export const itemsFromSearchDocuments = (
  documents: SkuDocument[],
  offers: SkuOffers,
  account: string,
  translations?: TranslatedProperty[]
) => {
  const items: SearchItem[] = []

  documents.forEach((skuDocument) => {
    const offer = offers[skuDocument.Id]

    if (!offer) {
      return
    }

    const variations = getSkuVariations(skuDocument.SpecificationGroups, skuDocument.AgregatedAttachments, translations)
    const images = convertDocumentImages(skuDocument.Images, account)
    const attachments = getAttachments(skuDocument.AgregatedAttachments)
    const nameComplete = `${
      getTranslationInfo('ProductName', translations, skuDocument.ProductId) ?? skuDocument.ProductName
    } ${getTranslationInfo('SkuName', translations, skuDocument.Id) ?? skuDocument.Name}`

    const searchItem = {
      itemId: skuDocument.Id,
      name: getTranslationInfo('SkuName', translations, skuDocument.Id) ?? skuDocument.Name,
      nameComplete,
      complementName: skuDocument.NameComplement,
      ean: skuDocument.AlternateIds.Ean ?? '',
      referenceId: [
        {
          Key: 'RefId',
          Value: skuDocument.AlternateIds.RefId,
        },
      ],
      measurementUnit: skuDocument.MeasurementUnit,
      unitMultiplier: skuDocument.UnitMultiplier,
      modalType: skuDocument.ModalType,
      images,
      Videos: skuDocument.Videos,
      variations,
      sellers: getSkuSellers(offer, skuDocument.UnitMultiplier),
      attachments,
      isKit: skuDocument.IsKit,
      kitItems: [],
    }

    items.push(searchItem)
  })

  return items
}

export const convertSearchDocument = async (
  documents: SkuDocument[],
  offers: SkuOffers,
  account: string,
  translations?: TranslatedProperty[]
) => {
  const [
    {
      ProductId,
      ProductName,
      BrandId,
      BrandName,
      NameComplement,
      LinkId,
      ProductRefId,
      AlternateIds,
      DirectCategoryId,
      ProductTitle,
      MetaTagDescription,
      ReleaseDate,
      ProductClusterHighlights,
      ProductClusterNames,
      ProductClusterSearchableIds,
      CategoriesFullPath,
      CategoriesName,
      Description,
      SpecificationGroups,
    },
  ] = documents

  const searchableClusters = searchableClustersFromDocument(ProductClusterNames, ProductClusterSearchableIds)

  const categories = categoriesFromDocument(CategoriesFullPath, CategoriesName, translations)
  const specificationsInfo = specificationsInfoFromDocument(SpecificationGroups, translations)
  const skuSpecifications = skuSpecificationsFromDocuments(
    documents.map((document) => document.SpecificationGroups),
    translations
  )

  const items = itemsFromSearchDocuments(documents, offers, account, translations)

  const product: SearchProduct & {
    cacheId?: string
    [key: string]: any
  } = {
    categories,
    categoriesIds: CategoriesFullPath,
    productId: ProductId,
    productName: getTranslationInfo('ProductName', translations) ?? ProductName,
    cacheId: `sp-${ProductId}`,
    productReference: ProductRefId || AlternateIds.RefId,
    linkText: LinkId,
    brand: getTranslationInfo('BrandName', translations) ?? BrandName,
    brandId: BrandId,
    link: `https://portal.vtexcommercestable.com.br/${LinkId}/p`,
    description: getTranslationInfo('Description', translations) ?? Description,
    items,
    priceRange: getPriceRange(items),
    categoryId: DirectCategoryId.toString(),
    productTitle: ProductTitle,
    metaTagDescription: MetaTagDescription ?? NameComplement ?? '',
    clusterHighlights: objToNameValue('id', 'name', ProductClusterHighlights),
    productClusters: objToNameValue('id', 'name', ProductClusterNames),
    searchableClusters,
    titleTag: '',
    categoryTree: [],
    skuSpecifications,
    ...specificationsInfo,
    origin: 'search-document',
    releaseDate: ReleaseDate,
  }

  return [product]
}

import { dateToTicks, getPriceRange, objToNameValue } from './utils'

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

const categoriesFromDocument = (CategoriesFullPath: string[], CategoriesName: Record<string, string>) => {
  const categories: string[] = []

  CategoriesFullPath.forEach((path) => {
    let categoryPath = '/'
    const ids = path.split('/').filter((value) => value)

    ids.forEach((id) => {
      categoryPath = categoryPath.concat(`${CategoriesName[id]}/`)
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

const specificationsInfoFromDocument = (SpecificationGroups: SkuDocumentSpecificationGroup[]): SpecificationInfo => {
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
      .map((specification) => ({
        name: specification.Name,
        originalName: specification.Name, // translate
        values: specification.SpecificationValues.map((spec) => spec.Value), // translate
      }))
      .forEach((spec) => properties.push(spec))

    const visibleSpecs = groupSpecs.filter((spec) => spec.IsOnProductDetails)

    if (visibleSpecs.length) {
      specificationGroups.push({
        name: group.GroupName, // translate
        originalName: group.GroupName,
        specifications: visibleSpecs.map((specification) => ({
          name: specification.Name,
          originalName: specification.Name,
          values: specification.SpecificationValues.map((spec) => spec.Value), // translate
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

const getSpotPrice = (paymentOptions: PaymentOptions, priceWithoutDiscount: number) => {
  const installments = paymentOptions.InstallmentOptions.flatMap((option) => option.Installments)
  const installment = installments.find(
    (inst) => inst.Count && inst.ValueAsInt && inst.ValueAsInt / 100 < priceWithoutDiscount
  )

  return installment ? installment.ValueAsInt / 100 : priceWithoutDiscount
}

const buildInstallments = (paymentOptions: PaymentOptions, unitMultiplier: number): SearchInstallment[] => {
  const installments: SearchInstallment[] = []

  paymentOptions.InstallmentOptions.forEach((option) => {
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
      sellerDefault: seller.sellerId === defaultSeller.sellerId,
      sellerName: seller.sellerName,
      addToCartLink: seller.addToCartLink,
      commertialOffer: seller.commertialOffer,
    }
  })

  return sellersWithDefault.sort((sellerA) => (sellerA.sellerDefault ? -1 : 1))
}

const getSkuSellers = (offer: SkuOfferDetails, unitMultiplier: number) => {
  const [salesChannel] = Object.keys(offer.SkuCommercialOfferPerSalesChannel)

  const seller1: Seller & { active: boolean } = {
    active: true,
    sellerId: offer.Seller1.SellerId,
    sellerName: offer.Seller1.Name,
    sellerDefault: false,
    addToCartLink: '', // fix
    commertialOffer: buildCommercialOffer(offer.SkuCommercialOfferPerSalesChannel[salesChannel], unitMultiplier),
  }

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

  return setDefaultSeller([seller1].concat(otherSellers))
}

const getSkuSubscriptions = (agregatedAttachments: SkuDocumentAttachment[]) =>
  agregatedAttachments.filter((attachment) => attachment.Name.includes('vtex.subscription.') && attachment.IsActive)

const getSkuVariations = (
  specificationGroups: SkuDocumentSpecificationGroup[],
  attachments: SkuDocumentAttachment[]
) => {
  const attributes: Array<{
    key: string
    value: string
  }> = []

  specificationGroups.forEach((group) => {
    const filteredSpecs = group.Specifications.filter(
      (specification) =>
        specification.SpecificationValues.filter((spec) => spec.Value).length && specification.Field.IsStockKeppingUnit
    ).map((specification) => ({
      ...specification,
      SpecificationValues: specification.SpecificationValues.filter((spec) => spec.Value),
    }))

    filteredSpecs.forEach((spec) => {
      spec.SpecificationValues.forEach((value) => {
        attributes.push({
          key: spec.Field.Name,
          value: value.Value,
        })
        // translate (ver text_attributes)
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

export const itemsFromSearchDocuments = (documents: SkuDocument[], offers: SkuOffers, account: string) => {
  const items: SearchItem[] = []

  documents.forEach((skuDocument) => {
    const offer = offers[skuDocument.Id]

    if (!offer) {
      return
    }

    const variations = getSkuVariations(skuDocument.SpecificationGroups, skuDocument.AgregatedAttachments)
    const images = convertDocumentImages(skuDocument.Images, account)
    const attachments = getAttachments(skuDocument.AgregatedAttachments)

    const searchItem = {
      itemId: skuDocument.Id,
      name: skuDocument.Name,
      nameComplete: skuDocument.NameComplete,
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
      videos: skuDocument.Videos,
      variations,
      sellers: getSkuSellers(offer, skuDocument.UnitMultiplier),
      attachments,
      isKit: skuDocument.IsKit,
      kitItems: [], // do we need to define this prop?
    }

    items.push(searchItem)
  })

  return items
}

export const convertSearchDocument = async (documents: SkuDocument[], offers: SkuOffers, account: string) => {
  const [
    {
      ProductId,
      ProductName,
      BrandId,
      BrandName,
      LinkId,
      ProductRefId,
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

  const categories = categoriesFromDocument(CategoriesFullPath, CategoriesName)
  // validar se só precisa pegar do primeiro item msm. talvez tenha que unir os itens
  const specificationsInfo = specificationsInfoFromDocument(SpecificationGroups)
  const items = itemsFromSearchDocuments(documents, offers, account)

  const product: SearchProduct & {
    cacheId?: string
    [key: string]: any
  } = {
    categories,
    categoriesIds: CategoriesFullPath,
    productId: ProductId,
    productName: ProductName,
    cacheId: `sp-${ProductId}`,
    productReference: ProductRefId,
    linkText: LinkId, // translate
    brand: BrandName,
    brandId: BrandId,
    link: `https://portal.vtexcommercestable.com.br/${LinkId}/p`,
    description: Description,
    items,
    priceRange: getPriceRange(items),
    categoryId: DirectCategoryId.toString(),
    productTitle: ProductTitle,
    metaTagDescription: MetaTagDescription,
    clusterHighlights: objToNameValue('id', 'name', ProductClusterHighlights),
    productClusters: objToNameValue('id', 'name', ProductClusterNames),
    searchableClusters,
    titleTag: '',
    categoryTree: [], // fix
    skuSpecifications: [], // fix
    ...specificationsInfo,
    origin: 'search-document',
    releaseDate: ReleaseDate,
  }

  return [product]
}

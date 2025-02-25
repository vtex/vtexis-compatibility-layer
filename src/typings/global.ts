export {}

declare global {
  type DynamicKey<T> = Record<string, T>
  interface BiggySearchProduct {
    name: string
    id: string
    timestamp: number
    product: string
    description: string
    reference?: string
    url: string
    link: string
    oldPrice: number
    price: number
    spotPrice?: number
    stock: number
    brand: string
    brandId: string
    installment?: BiggyInstallment
    measurementUnit: string
    unitMultiplier: number
    tax: number
    images: BiggyProductImage[]
    skus: BiggySearchSKU[]
    categories: string[]
    categoryIds: string[]
    extraData: BiggyProductExtraData[]
    productSpecifications: string[]
    specificationGroups: string
    textAttributes: BiggyTextAttribute[]
    numberAttributes: BiggyNumberAttribute[]
    split?: BiggySplit
    categoryTrees: BiggyCategoryTree[]
    clusterHighlights: Record<string, string>
    year: number
    release: number
    wear: number
    discount: number
    showIfNotAvailable: boolean
    collections: BiggyCollection[]
    customSort: number
    stickers: BiggySticker[]
    availableTradePolicies: string[]
    locationAttributes: string[]
    productScore: number
    storeSplitAttribute: string
    boost: BiggyBoost
    headSku: string
    extraInfo: BiggyExtraInfo
    metaTagDescription?: string
    productTitle?: string
    oldPriceText: string
    priceText: string
    spotPriceText?: string
    rule?: Rule
  }

  type Rule = {
    id: string
  }

  interface BiggyExtraInfo {
    sellerId: string
  }
  interface BiggyBoost {
    newness: number
    image: number
    revenue: number
    discount: number
    productScore: number
    click: number
    availableSpecsCount: number
    promotion: number
    order: number
  }

  interface BiggyCollection {
    id: string
    position: number
  }

  interface BiggySticker {
    image: string
    name: string
    location: string
    target: string
  }

  interface BiggyInstallment {
    value: number
    count: number
    interest: boolean
    paymentGroupName: string
    paymentName: string
    valueText?: string
  }

  interface BiggyProductImage {
    name?: string
    value: string
  }

  interface BiggySearchSKU {
    name: string
    nameComplete: string
    complementName?: string
    id: string
    ean?: string
    idWithSplit: string
    reference: string
    image?: string
    images: BiggyProductImage[]
    videos?: string[]
    icon?: string
    stock?: number
    oldPrice?: number
    oldPriceText?: string
    price?: number
    priceText?: string
    spotPrice?: number
    spotPriceText?: string
    measurementUnit?: string
    unitMultiplier?: number
    link?: string
    attributes: BiggySKUAttribute[]
    sellers: BiggySeller[]
    policies: BiggyPolicy[]
    catalogAttributes?: BiggySKUCatalogAttribute[]
  }

  interface BiggyProductExtraData {
    key: string
    value: string
  }

  interface BiggyTextAttribute {
    labelKey: string
    labelValue: string
    key: string
    value: string
    isFilter: boolean
    id: string[]
    valueId?: string
    isSku: boolean
    joinedKey: string
    joinedValue: string
    joinedKeyTranslations: { [key: string]: string }
    joinedValueTranslations: { [key: string]: string }
  }

  interface BiggyNumberAttribute {
    labelKey: string
    value: number
    key: string
  }

  interface BiggySplit {
    labelKey: string
    labelValue: string
  }

  interface BiggySKUAttribute {
    key: string
    value: string
  }

  interface BiggySKUCatalogAttribute {
    id: string
    name: string
    value: string
    visible: boolean
  }

  interface BiggyCategoryTree {
    categoryNames: string[]
    categoryIds: string[]
  }

  interface BiggySeller {
    id: string
    name: string
    oldPrice?: number
    price?: number
    spotPrice?: number
    stock?: number
    tax: number
    default: boolean
    teasers?: Teaser[]
    installment?: BiggyInstallment
  }

  interface BiggyPolicy {
    id: string
    sellers: BiggySeller[]
  }

  interface Range {
    from: number
    to: number
  }

  interface SelectedFacet {
    key: string
    value: string
  }

  interface QueryArgs {
    query: string
    map?: string
    selectedFacets?: SelectedFacet[]
  }

  interface SearchArgs extends QueryArgs {
    category: string | null
    specificationFilters: string[] | null
    priceRange?: string | null
    collection: string | null
    salesChannel: string | null
    orderBy: string | null
    from: number | null
    to: number | null
    hideUnavailableItems: boolean | null
    simulationBehavior: 'skip' | 'default' | null
    completeSpecifications: boolean
  }

  interface Metadata {
    metaTagDescription?: string
    titleTag?: string
  }

  interface Brand {
    id: string
    name: string
    isActive: boolean
    title: string | null
    metaTagDescription: string | null
    imageUrl: string | null
  }

  interface CategoryTreeResponse {
    id: number
    name: string
    hasChildren: boolean
    url: string
    children: CategoryTreeResponse[]
    Title: string
    MetaTagDescription: string
  }

  interface CategoryByIdResponse {
    parentId: number | null
    GlobalCategoryId: number
    GlobalCategoryName: string
    position: number
    slug: string
    id: number
    name: string
    hasChildren: boolean
    url: string
    children: null
    Title: string
    MetaTagDescription: string
  }

  interface FacetsArgs extends QueryArgs {
    hideUnavailableItems?: boolean
    behavior?: FacetsBehavior
  }

  type FacetsBehavior = 'Static' | 'Dynamic'

  interface SellerMerchantInstallment {
    Id: string
    Count: number
    HasInterestRate: boolean
    InterestRateAsInt: number
    Value: number
    ValueAsInt: number
    Total: number
    TotalAsInt: number
  }

  interface SkuOfferInstallment {
    Count: number
    HasInterestRate: boolean
    InterestRateAsInt: number
    Value: number
    ValueAsInt: number
    Total: number
    TotalAsInt: number
    SellerMerchantInstallments: SellerMerchantInstallment[]
  }

  interface SkuOfferInstallmentOption {
    Bin?: any
    PaymentSystem: string
    PaymentName: string
    PaymentGroupName: string
    Value: number
    ValueAsInt: number
    Installments: SkuOfferInstallment[]
  }

  interface PaymentOptions {
    UpdateStatus: any // validate
    InstallmentOptions: SkuOfferInstallmentOption[]
    [key: string]: any
  }

  interface RatesAndBenefitsData {
    // validate
    RateAndBenefitsIdentifiers: any[]
    Teaser: SkuOfferTeaser[]
  }

  interface SKUSeller {
    SellerId: string
    SellerType: number
    SellerName: string
    AvailableSalesChannels: number[]
    StockKeepingUnitId: number
    SellerStockKeepingUnitId: string
    SkuCommercialOffer: SalesChannelOffer
    IsActive: boolean
    [key: string]: any
  }

  interface SalesChannelOffer extends CommertialOfferBase {
    IsAvailable: boolean
    DeliverySlaSamples: any[]
    RatesAndBenefitsData: RatesAndBenefitsData | null
    PaymentOptions: PaymentOptions | null
  }

  interface SkuOfferDetails {
    SkuId: string
    SkuSellers: SKUSeller[]
    RealTimeCalculated: boolean
    ErrorsDuringGetSkuCommercialContainer: boolean
    SkuSellerCommunicationErrors: unknown[]
    SkuCommercialOfferPerSalesChannel: {
      [salesChannel: string]: SalesChannelOffer
    }
    Seller1: {
      SellerId: string
      Name: string
      SellerType: number
    }
  }

  interface SkuOffers {
    [skuId: string]: SkuOfferDetails
  }

  interface SkuDocument {
    Id: string
    AlternateIds: Record<string, string>
    AlternateIdValues: string[]
    ProductId: string
    VtexScore: number
    ProductRefId: string
    MetaTagDescription: string | null
    ReleaseDate: string
    GTIN: string
    IsVisible: boolean
    IsActive: boolean
    IsKit: boolean
    IsKitOptimized: boolean
    FlagKitItensSellApart: boolean
    IsTransported: boolean
    IsInventoried: boolean
    IsGiftCardRecharge: boolean
    Name: string
    NameComplete: string
    ProductName: string
    ProductTitle: string
    NameComplement: string
    Description: string
    Dimension: Record<string, number | null>
    LinkId: string
    ManufacturerCode: string
    BrandId: number
    BrandName: string
    BrandUriName?: string
    IsBrandActive: boolean
    DirectCategoryId: number
    CategoriesId: number[]
    CategoriesName: Record<string, string>
    CategoriesFullPathUriName?: string
    IsDirectCategoryActive?: boolean
    CategoriesFullPath: string[]
    DepartmentId?: number
    AcceptedGlobalCategoryId?: number
    SuggestedGlobalCategoryId: number
    ProductClusterIds: number[]
    PositionsInClusters: Record<string, number>
    ProductClusterNames: Record<string, string>
    ProductClusterHighlights: Record<string, string>
    ProductClusterHighLightIds: any[]
    ProductClusterSearchableIds: number[]
    ProductClusterOrder: Record<string, number>
    ShowIfNotAvailable: boolean
    KeyWords: string
    BrandKeyWords: string
    CategoryKeyWords: string
    RewardValue: number
    CommercialConditionId?: number
    ModalType: any
    SkuKitsItems?: any[]
    Position: number
    MeasurementUnit: string
    TaxCode: string | null
    UnitMultiplier: number
    SalesChannels: number[]
    Videos: any[]
    Images: SkuDocumentImage[]
    MainImage?: SkuDocumentImage
    Complements?: Record<string, string[]>
    AgregatedAttachments: SkuDocumentAttachment[]
    AgregatedServices: AgregatedService[]
    SpecificationGroups: SkuDocumentSpecificationGroup[]
    IsProductActive: boolean
    Attributes: unknown[]
    SkuSellers?: unknown[]
    EstimatedDateArrival?: any
  }

  interface AgregatedService {
    Name: string
    Description: string
    ListPrice: number
    Price: number
    PriceName: string
    Type: number
    Id: number
    HasServicesVisibleOnCart: boolean
    HasServicesVisibleOnProduct: boolean
    HasServicesVisibleOnService: boolean
    IsFile: boolean
    IsGiftCard: boolean
    IsRequired: boolean
    AgregatedAttachments: SkuDocumentAttachment[]
  }

  interface SkuDocumentAttachment {
    Id: number
    Name: string
    DomainValues: string
    IsActive: boolean
    IsRequired: boolean
    Schema?: unknown
  }

  interface SkuDocumentImage {
    ImageId: string
    ImageLabel: string
    ImageTag: string
    ImagePath: string
    IsMain: boolean
    IsZoomSize: boolean
    ImageText: string | null
    LastModified: string
  }

  interface SkuDocumentSpecificationGroup {
    Id: number
    GroupName: string
    Position: number
    CategoryId: number | null
    Specifications: SkuDocumentSpecification[]
  }

  interface SkuDocumentSpecificationValue {
    Id: string
    Position: number
    Value: string
  }

  interface SkuDocumentSpecificationField {
    Id: number
    FieldGroupId: number
    Name: string
    Description: string | null
    IsRequired: boolean
    IsOnProductDetails: boolean | null
    CategoryId: number | null
    IsFilter: boolean
    Position: number
    IsStockKeppingUnit: boolean
    IsActive: boolean
    IsSideMenuLinkActive: boolean
    IsTopMenuLinkActive: boolean | null
    FieldTypeId: number
  }

  interface SkuDocumentSpecification {
    Field: SkuDocumentSpecificationField | null
    IsOnProductDetails: boolean
    FieldId: string
    Name: string
    Position: number
    SpecificationValues: SkuDocumentSpecificationValue[]
  }

  interface SearchProduct {
    cacheId: string
    productId: string
    productName: string
    brand: string
    brandId: number
    linkText: string
    productReference?: string
    categoryId: string
    categoryTree: Category[]
    productTitle?: string
    metaTagDescription: string
    clusterHighlights: Array<Record<string, string>>
    productClusters: Array<Record<string, string>>
    searchableClusters?: Record<string, string>
    categories: string[]
    categoriesIds?: string[]
    link: string
    description: string
    items: SearchItem[]
    itemMetadata?: {
      items: SearchMetadataItem[]
    }
    titleTag: string
    properties: ProductProperty[]
    Specifications?: string[]
    allSpecifications?: string[]
    allSpecificationsGroups?: string[]
    completeSpecifications?: CompleteSpecification[]
    skuSpecifications: SkuSpecification[]
    specificationGroups: SpecificationGroup[]
    priceRange: PriceRange
  }

  interface SpecificationGroup {
    originalName: string
    name: string
    specifications: SpecificationGroupProperty[]
  }

  interface SpecificationGroupProperty {
    originalName: string
    name: string
    values: string[]
  }

  interface PriceRange {
    sellingPrice: {
      highPrice: number
      lowPrice: number
    }
    listPrice: {
      highPrice: number
      lowPrice: number
    }
  }
  interface Category {
    id: number
    name: string
    href: string
    children?: Category[]
  }

  interface SearchAttachment {
    id: number
    name: string
    required: boolean
    domainValues: string
  }

  interface SearchItem {
    itemId: string
    name: string
    nameComplete: string
    complementName: string
    ean: string
    referenceId: Array<{ Key: string; Value: string }>
    measurementUnit: string
    unitMultiplier: number
    modalType?: any | null
    images: SearchImage[]
    videos?: string[]
    variations: Variation[]
    sellers: Seller[]
    attachments: SearchAttachment[]
    isKit?: boolean
    kitItems?: Array<{
      itemId: string
      amount: number
    }>
    attributes?: BiggySKUCatalogAttribute[]
  }

  interface Variation {
    name: string
    values: string[]
  }

  interface CompleteSpecification {
    Values: Array<{
      Id: string
      Position: number
      Value: string
    }>
    Name: string
    Position: number
    IsOnProductDetails: boolean
    FieldId: string
  }

  interface SearchItemExtended extends SearchItem {
    skuSpecifications?: SkuSpecification[]
  }

  interface SkuSpecification {
    field: SKUSpecificationField
    values: SKUSpecificationValue[]
  }

  interface SKUSpecificationField {
    name: string
    originalName?: string
    id?: string
  }

  interface SKUSpecificationValue {
    name: string
    id?: string
    fieldId?: string
    originalName?: string
  }

  interface SearchImage {
    cacheId: string
    imageId: string
    imageLabel: string | null
    imageTag: string
    imageUrl: string
    imageText: string | null
  }

  interface SearchInstallment {
    Value: number
    InterestRate: number
    TotalValuePlusInterestRate: number
    NumberOfInstallments: number
    PaymentSystemName: string
    PaymentSystemGroupName?: string
    Name: string
  }

  interface CommertialOfferBase {
    Price: number
    ListPrice: number
    PriceWithoutDiscount: number
    RewardValue: number
    PriceValidUntil: string | null
    AvailableQuantity: number
    Tax: number
    GetInfoErrorMessage?: any | null
    CacheVersionUsedToCallCheckout: string
  }

  interface CommertialOffer extends CommertialOfferBase {
    DeliverySlaSamplesPerRegion?: Record<string, { DeliverySlaPerTypes: any[]; Region: any | null }>
    Installments: SearchInstallment[]
    discountHighlights?: any[]
    GiftSkuIds: string[]
    teasers: Teaser[]
    BuyTogether?: any[]
    ItemMetadataAttachment?: any[]
    spotPrice: number
    taxPercentage: number
    DeliverySlaSamples: Array<{
      DeliverySlaPerTypes: any[]
      Region: any | null
    }>
  }

  interface Seller {
    sellerId: string
    sellerName: string
    addToCartLink: string
    sellerDefault: boolean
    commertialOffer: CommertialOffer
    error?: string
  }

  interface SearchFacet {
    Quantity: number
    Name: string
    Link: string
    LinkEncoded: string
    Map: string
    Value: string
  }

  interface SearchFacetCategory {
    Id: number
    Quantity: number
    Name: string
    Link: string
    LinkEncoded: string
    Map: string
    Value: string
    Children: SearchFacetCategory[]
  }

  interface SummaryItem {
    DisplayedItems: number
    TotalItems: number
  }

  interface SearchFacets {
    Departments: SearchFacet[]
    Brands: SearchFacet[]
    SpecificationFilters: Record<string, SearchFacet[]>
    CategoriesTrees: SearchFacetCategory[]
    PriceRanges: Array<{
      Slug: string
      Quantity: number
      Name: string
      Link: string
      LinkEncoded: string
      Map: null
      Value: string
    }>
    Summary: {
      Departments: SummaryItem
      CategoriesTrees: SummaryItem
      Brands: SummaryItem
      PriceRanges: SummaryItem
      SpecificationFilters: Record<string, SummaryItem>
    }
  }

  interface SearchAutocompleteItem {
    productId: string
    itemId: string
    name: string
    nameComplete: string
    imageUrl: string
  }

  interface SearchAutocompleteUnit {
    items: SearchAutocompleteItem[]
    thumb: string
    thumbUrl: string | null
    name: string
    href: string
    criteria: string
  }

  interface FieldTreeResponseAPI {
    Name: string
    CategoryId: number
    FieldId: number
    IsActive: boolean
    IsStockKeepingUnit: boolean
  }

  interface FieldResponseAPI {
    Name: string
    CategoryId: number | null
    FieldId: number
    IsActive: boolean
    IsRequired: boolean
    FieldTypeId: number
    FieldTypeName: string
    FieldValueId: string | null
    Description: string | null
    IsStockKeepingUnit: boolean
    IsFilter: boolean
    IsOnProductDetails: boolean
    Position: number
    IsWizard: boolean
    IsTopMenuLinkActive: boolean
    IsSideMenuLinkActive: boolean
    DefaultValue: string | null
    FieldGroupId: number
    FieldGroupName: string
  }

  interface FieldValuesResponseAPI {
    FieldValueId: number
    Value: string
    Position: number
    IsActive: boolean
  }

  interface SearchMetadataItem {
    Name: string
    NameComplete: string
    MainImage: string
    BrandName: string
    CategoryId: number
    ProductId: number
    id: string
    seller: string
    assemblyOptions: AssemblyOption[]
  }

  interface AssemblyOption {
    id: string
    name: string
    composition: Composition | null
    inputValues: InputValues
  }

  interface Composition {
    minQuantity: number
    maxQuantity: number
    items: CompositionItem[]
  }

  interface CompositionItem {
    id: string
    minQuantity: number
    maxQuantity: number
    initialQuantity: number
    priceTable: string
    seller: string
  }

  interface InputValues {
    [key: string]: RawInputValue
  }

  interface RawInputValue {
    maximumNumberOfCharacters: number
    domain: string[]
  }
  interface ProductProperty {
    name: string
    originalName: string
    values: string[]
  }

  interface Teaser {
    id?: string
    name: string
    conditions: TeaserCondition
    effects: TeaserEffects
    featured?: boolean
    teaserType?: string
  }

  interface TeaserCondition {
    minimumQuantity: number
    parameters: TeaserValue[]
  }

  interface TeaserEffects {
    parameters: TeaserValue[]
  }

  interface TeaserValue {
    name: string
    value: string
  }

  interface SkuOfferTeaser {
    Id?: string
    Name: string
    TeaserCondition: SkuOfferTeaserCondition
    TeaserEffect: SkuOfferTeaserEffects
    Featured?: boolean
    TeaserType?: string
  }

  interface SkuOfferTeaserCondition {
    ConditionParameters: NameValue[]
    MinimumQuantity: number
  }

  interface SkuOfferTeaserEffects {
    EffectParameters: NameValue[]
  }

  interface NameValue {
    Name: string
    Value: string
  }

  type IndexingType = 'API' | 'XML'

  interface TranslatedProperty {
    field: string
    context: string
    translation: string
  }
}

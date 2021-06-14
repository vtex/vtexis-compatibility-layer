export {}

declare global {
  type DynamicKey<T> = Record<string, T>
  interface BiggySearchProduct {
    name: string
    id: string
    timestamp: number
    product: string
    description: string
    reference: string
    url: string
    link: string
    oldPrice: number
    price: number
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
    numberAttributes: BiggyTextAttribute[]
    split: BiggySplit
    categoryTrees: BiggyCategoryTree[]
    clusterHighlights: Record<string, string>
  }

  interface BiggyInstallment {
    value: number
    count: number
    interest: boolean
  }

  interface BiggyProductImage {
    name: string
    value: string
  }

  interface BiggySearchSKU {
    name: string
    nameComplete: string
    complementName: string
    id: string
    ean?: string
    reference: string
    image: string
    images: BiggyProductImage[]
    videos?: string[]
    stock: number
    oldPrice: number
    price: number
    measurementUnit: string
    unitMultiplier: number
    link: string
    attributes: BiggySKUAttribute[]
    sellers: BiggySeller[]
    policies: BiggyPolicy[]
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
    id: string
    valueId: string
    isSku: boolean
    joinedKey: string
    joinedValue: string
  }

  interface BiggySplit {
    labelKey: string
    labelValue: string
  }

  interface BiggySKUAttribute {
    key: string
    value: string
  }

  interface BiggyCategoryTree {
    categoryNames: string[]
    categoryIds: string[]
  }

  interface BiggySeller {
    id: string
    name: string
    oldPrice: number
    price: number
    stock: number
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

  interface SearchProduct {
    productId: string
    productName: string
    brand: string
    brandId: number
    linkText: string
    productReference: string
    categoryId: string
    productTitle: string
    metaTagDescription: string
    clusterHighlights: Array<Record<string, string>>
    productClusters: Array<Record<string, string>>
    searchableClusters: Record<string, string>
    categories: string[]
    categoriesIds: string[]
    link: string
    description: string
    items: SearchItem[]
    itemMetadata: {
      items: SearchMetadataItem[]
    }
    titleTag: string
    properties: ProductProperty[]
    Specifications?: string[]
    allSpecifications?: string[]
    allSpecificationsGroups?: string[]
    completeSpecifications?: CompleteSpecification[]
    skuSpecifications?: SkuSpecification[]
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
    modalType: any | null
    images: SearchImage[]
    Videos: string[]
    variations: string[]
    sellers: Seller[]
    attachments: Array<{
      id: number
      name: string
      required: boolean
      domainValues: string
    }>
    isKit: boolean
    kitItems?: Array<{
      itemId: string
      amount: number
    }>
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
    imageId: string
    imageLabel: string | null
    imageTag: string
    imageUrl: string
    imageText: string
  }

  interface SearchInstallment {
    Value: number
    InterestRate: number
    TotalValuePlusInterestRate: number
    NumberOfInstallments: number
    PaymentSystemName: string
    PaymentSystemGroupName: string
    Name: string
  }

  interface CommertialOffer {
    DeliverySlaSamplesPerRegion: Record<string, { DeliverySlaPerTypes: any[]; Region: any | null }>
    Installments: SearchInstallment[]
    DiscountHighLight: any[]
    GiftSkuIds: string[]
    Teasers: Teaser[]
    BuyTogether: any[]
    ItemMetadataAttachment: any[]
    Price: number
    ListPrice: number
    spotPrice: number
    taxPercentage: number
    PriceWithoutDiscount: number
    RewardValue: number
    PriceValidUntil: string
    AvailableQuantity: number
    Tax: number
    DeliverySlaSamples: Array<{
      DeliverySlaPerTypes: any[]
      Region: any | null
    }>
    GetInfoErrorMessage: any | null
    CacheVersionUsedToCallCheckout: string
  }

  interface Seller {
    sellerId: string
    sellerName: string
    addToCartLink: string
    sellerDefault: boolean
    commertialOffer: CommertialOffer
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

  interface ElasticImage {
    name: string
    value: string
  }

  interface ProductProperty {
    name: string
    originalName: string
    values: string[]
  }

  interface Teaser {
    name: string
    conditions: TeaserCondition
    effects: TeaserEffects
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
}

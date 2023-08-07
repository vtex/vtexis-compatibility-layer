import { getPriceRange } from './utils'

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

interface SpecificationInfo {
  allSpecifications?: string[]
  allSpecificationsGroups?: string[]
  completeSpecifications?: CompleteSpecification[]
  [key: string]: any
}

const specificationsInfoFromDocument = (SpecificationGroups: SkuDocumentSpecificationGroup[]): SpecificationInfo => {
  const allSpecifications: string[] = []
  const allSpecificationsGroups: string[] = []
  const completeSpecifications: any[] = []
  const specificationsInfo: SpecificationInfo = {}

  SpecificationGroups.forEach((group) => {
    const specs = group.Specifications.filter(
      (specification) => specification.SpecificationValues.filter((spec) => spec.Value).length
    )

    if (!specs.length) {
      return
    }

    allSpecificationsGroups.push(group.GroupName)
    specs.forEach(({ Name, Position, IsOnProductDetails, FieldId, SpecificationValues }) => {
      specificationsInfo[Name] = SpecificationValues.map((value) => value.Value)
      allSpecifications.push(Name)
      completeSpecifications.push({
        Name,
        Position,
        IsOnProductDetails,
        FieldId,
        Values: SpecificationValues,
      })
    })

    specificationsInfo[group.GroupName] = specs.map((spec) => spec.Name)
  })

  return {
    ...specificationsInfo,
    allSpecifications,
    allSpecificationsGroups,
    completeSpecifications,
  }
}

export const convertSearchDocument = async (documents: SkuDocument[], itemsFromSearch: SearchItem[]) => {
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
  const specificationsInfo = specificationsInfoFromDocument(SpecificationGroups)

  const product = {
    productId: ProductId,
    productName: ProductName,
    brand: BrandName,
    brandId: BrandId,
    brandImageUrl: null,
    linkText: LinkId,
    productReference: ProductRefId,
    categoryId: DirectCategoryId.toString(),
    productTitle: ProductTitle,
    metaTagDescription: MetaTagDescription,
    releaseDate: ReleaseDate,
    clusterHighlights: ProductClusterHighlights,
    productClusters: ProductClusterNames,
    searchableClusters,
    categories,
    categoriesIds: CategoriesFullPath,
    ...specificationsInfo,
    description: Description,
    items: itemsFromSearch,
    link: '',
    origin: 'catalog',
    titleTag: '',
    priceRange: getPriceRange(itemsFromSearch),
  }

  return [product]
}

import convertSKU from './convertSKU'
import { getPriceRange, objToNameValue } from './utils'

interface Specification {
  values: string[]
  labelKey: string
}

const filterVisibleSpecifications = (
  specificationKeys: string[],
  visibleSpecifications: Record<string, boolean> | null
) =>
  specificationKeys.filter((specificationName) => {
    if (visibleSpecifications?.[specificationName] != null) {
      return visibleSpecifications[specificationName]
    }

    return true
  })

const getSpecificationGroups = (
  product: SearchProduct & {
    [key: string]: any
  },
  specificationGroupsMap: DynamicKey<string[]>,
  specificationsMap: DynamicKey<Specification>
) => {
  const allSpecificationsGroups = product.allSpecificationsGroups ?? []

  const visibleSpecifications = product.completeSpecifications
    ? product.completeSpecifications.reduce<Record<string, boolean>>((acc, specification) => {
        acc[specification.Name] = specification.IsOnProductDetails

        return acc
      }, {})
    : null

  const specifications = allSpecificationsGroups.map((groupName: string) => {
    const specificationsFromGroup = specificationGroupsMap[groupName]

    const visibleSpecificationsFromGroup = filterVisibleSpecifications(specificationsFromGroup, visibleSpecifications)

    return {
      originalName: groupName,
      name: groupName,
      specifications: visibleSpecificationsFromGroup.map((name) => {
        if (!specificationsMap[name]) {
          return {
            name,
            originalName: name,
            values: [],
          }
        }

        const { values, labelKey } = specificationsMap[name]

        return {
          originalName: name,
          name: labelKey,
          values,
        }
      }),
    }
  })

  specifications.push({
    originalName: 'allSpecifications',
    name: 'allSpecifications',
    specifications: filterVisibleSpecifications(product.allSpecifications as string[], visibleSpecifications).map(
      (name) => {
        const { values, labelKey } = specificationsMap[name]

        return {
          originalName: name,
          name: labelKey,
          values,
        }
      }
    ),
  })

  return specifications
}

const getProperties = (
  product: SearchProduct & {
    [key: string]: any
  },
  specificationsMap: DynamicKey<Specification>
) =>
  (product.allSpecifications ?? []).map((name: string) => {
    const { labelKey, values } = specificationsMap[name]

    return {
      name: labelKey,
      originalName: name,
      values,
    }
  })

export const convertISProduct = (product: BiggySearchProduct, tradePolicy?: string, indexingType?: IndexingType) => {
  const categories: string[] = []
  const categoriesIds: string[] = []
  const categoryTree: Category[] = []

  product.categoryTrees?.forEach((category) => {
    const { categoryIds, categoryNames } = category

    categories.push(`/${categoryNames.join('/')}/`)
    categoriesIds.push(`/${categoryIds.join('/')}/`)
    categoryTree.push({
      id: Number(categoryIds[categoryIds.length - 1]),
      name: categoryNames[categoryNames.length - 1],
      href: '',
    })
  })

  const skus: SearchItem[] = (product.skus ?? []).map(convertSKU(product, indexingType, tradePolicy))

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

  const allSpecifications = (product.productSpecifications ?? []).concat(
    Array.from(new Set(specificationAttributes.map((specification) => specification.labelKey)))
  )

  const specificationsByKey = specificationAttributes.reduce(
    (specsByKey: { [key: string]: BiggyTextAttribute[] }, spec) => {
      // the joinedKey has the format text@@@key@@@labelKey@@@originalKey@@@originalLabelKey
      // eslint-disable-next-line prefer-destructuring
      const value = spec.joinedKey.split('@@@')[3]

      specsByKey[value] = (specsByKey[value] ?? []).concat(spec)

      return specsByKey
    },
    {}
  )

  const specKeys = Object.keys(specificationsByKey)

  const skuSpecifications = specKeys.map((key) => {
    // eslint-disable-next-line prefer-destructuring
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
    (specsByKey: { [key: string]: BiggyNumberAttribute[] }, spec) => {
      const value = spec.labelKey

      specsByKey[value] = (specsByKey[value] ?? []).concat(spec)

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
    productId: product.product,
    cacheId: `sp-${product.id}`,
    productName: product.name,
    productReference: product.reference,
    linkText: product.link,
    brand: product.brand ?? '',
    brandId,
    link: product.url,
    description: product.description,
    items: skus,
    priceRange: getPriceRange(skus),
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
    specificationGroups,
    selectedProperties,
    skuSpecifications: allSkuSpecification,
    properties: [],
    categoryTree,
    rule: product.rule,
    releaseDate: product.release,
  }

  const specifications: DynamicKey<Specification> = {}

  if (product.extraData) {
    product.extraData.forEach(({ key, value }: BiggyProductExtraData) => {
      convertedProduct.allSpecifications?.push(key)
      specifications[key] = { labelKey: key, values: [value] }
    })
  }

  if (product.textAttributes) {
    allSpecifications.forEach((specification) => {
      if (specifications[specification]) {
        return
      }

      const attributes = product.textAttributes.filter(
        (attribute) => attribute.joinedKey.split('@@@')[4] === specification
      )

      const labelKey = attributes[0]?.labelKey ?? specification

      specifications[specification] = {
        labelKey,
        values: attributes.map(({ labelValue }) => labelValue),
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

  convertedProduct.properties = getProperties(convertedProduct, specifications)
  convertedProduct.specificationGroups = getSpecificationGroups(convertedProduct, specificationGroups, specifications)

  return convertedProduct
}

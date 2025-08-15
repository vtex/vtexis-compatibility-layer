# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [1.11.2] - 2025-08-15

### Removed

- `getDefaultSeller` redundancy

## [1.11.1] - 2025-08-14

### Changed

- Now merge simulation sellers by sellerId instead of array position

## [1.11.0] - 2025-07-15

### Added

- only3p simulationBehavior

## [1.10.0] - 2025-07-02

### Added

- `tags` field to search product
- `ignoreSimulationQuantity` option on `mergeProductWithItems`

## [1.9.0] - 2025-06-10

### Changed
- `deliveryPromisesBadges` field to search product to allow objects instead of string

## [1.8.0] - 2025-05-05

### Added
- `deliveryPromisesBadges` field to search product

## [1.7.4] - 2025-03-13

### Removed
- When `Price=0` we assume that the `AvailableQuantity` is `0`. This validation was used for the `priceWithoutFulFillment` situation, but it is not necessary anymore because it was unintentionally fixed [here](https://github.com/vtex-apps/search-resolver/pull/121).

## [1.7.3] - 2025-03-13

## [1.7.2] - 2025-03-11

### Added
- `regionalize1p` as a `simulationBehavior` option.

## [1.7.1] - 2025-02-25

### Added
- Add `productTitle` and `titleTag` for ID requests on `americanas`

## [1.7.0] - 2024-04-22

### Fixed
- Error when SKU has no sellers.
- Duplicated values for SKU specifications.

## [1.6.3] - 2024-04-01

### Fixed
- Error when sku offer has no payment option.

## [1.6.2] - 2024-03-20

### Fixed
- Remove specifications with no values from `skuSpecifications`.

## [1.6.1] - 2024-03-18

### Fixed
- Product `properties` and `metaTagDescription` for PDP compatibility.

## [1.6.0] - 2024-03-05

### Added

- Translations to product query.

## [1.5.0] - 2024-02-27

### Changed
- Get SKU details from SKU document when mapping search document.

## [1.4.1] - 2024-02-08

## [1.4.0] - 2024-02-08

### Added

- New fields / conversion from SKU catalogAttributes to item attributes

## [1.3.0] - 2023-08-15

### Added
- Mapping from search document to product.

## [1.2.13] - 2022-12-20

### Fixed

- Bug where the specifications were converted to an empty array.

## [1.2.11] - 2022-12-14

### Fixed

- The `converISProduct` throws an error due to an inconsistency in the specifications format.

## [1.2.7] - 2022-12-14

### Fixed

- `extraData` is not being converted properly.

## [1.2.6] - 2022-12-14

### Fixed

- Use `labelKey` instead of `originalKey` when converting specifications.

## [1.2.5] - 2022-12-08

### Fixed

- Duplicated specifications in `allSpecifications` group.

## [1.2.4] - 2022-09-22

### Changed

- Skip merge when there is an error on simulation.

## [1.2.3] - 2021-15-25

### Added

- Add "files" field to `package.json` to allow `yarn publish`

## [1.1.0] - 2021-10-25

### Added

- Add rule to the product field.
- Forwards `release` field as `releaseDate`

## [1.0.0] - 2021-10-25

### Fixed

- Fix a few fields to allow the `intelligent-search-api` migration.

## [0.2.5] - 2021-10-25

### Fixed

- `productId`

## [0.2.4] - 2021-10-25

### Fixed

- `productId`

## [0.2.3] - 2021-10-08

### Changed

- `spotPrice` calculation

## [0.2.2] - 2021-09-30

### Fixed

- `variations` translation

## [0.2.1] - 2021-09-09

### Fixed

- Use the `getFirstNonNullable` to select the correct price

## [0.2.0] - 2021-09-09

### Added

- `only1p` as a `simulationBehavior` option

## [0.1.1] - 2021-09-02

### Added

- lint.
- main test cases.
- github workflow.

### Changed

- Change npm package to the `@vtex` organization

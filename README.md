# vtexis-compatibility-layer

Lib to convert the Intelligent Search object to the VTEX object.

## Example

```js
    import { convertISProduct } from 'vtexis-compatibility-layer'

    const vtexProduct = convertISProduct(intelligentSearchProduct, tradePolicy)
```

## Deploy

- Merge your PR to the `main` branch
- `git checkout main`
- `git pull`
- Update the `CHANGELOG.md` file
- `npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]` on the `main` branch.
- Run `git push origin main --tags`
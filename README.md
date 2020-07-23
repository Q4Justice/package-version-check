# package-version-check
GitHub Action for ensuring the version string of package.json has been incremented.

## Inputs
### `github-token`
**Required** The GitHub Secret Token to use for fetching `package.json`.

### `package-file`
**Required** The path to package.json. Default `'package.json'`.

## Outputs
### `is_incremented`
True if the version in package.json has been incremented and false otherwise.

## Example usage
```yaml
uses: Q4Justice/package-version-check@v1
with:
  package-file: './SomeDirectory/package.json'
```

# Deploy to Skynet action

This action deploys a directory to [Skynet](https://siasky.net) and comments on pull request with a skylink url.

## Inputs

### `upload-dir`

**Required** Directory to upload (usually `dist`, `out` or `public`).

This action requires the upload directory to be already available so you will need to run the build step before running this action.

### `github-token`

**Required** Your github token that is required to authenticate posting a comment on pull request.

Find out more about github token from [documentation](https://docs.github.com/en/free-pro-team@latest/actions/reference/authentication-in-a-workflow).

## Outputs

### `skylink`

The resulting skylink.

Example: `sia://IAC6CkhNYuWZqMVr1gob1B6tPg4MrBGRzTaDvAIAeu9A9w`.

## Example usage

```yaml
uses: kwypchlo/deploy-to-skynet-action@v1
with:
  upload-dir: public
  github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Full workflow example

```yaml
name: My CI Pipeline

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v1
        with:
          node-version: 14.x

      - name: Install dependencies
        run: yarn

      - name: Build webapp
        run: yarn build

      - name: Upload to Skynet
        uses: kwypchlo/deploy-to-skynet-action@v1
        with:
          upload-dir: public
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

# Deploy to Skynet action

This action deploys a directory to Skynet and comments on pull request with a skylink url (defaults to [siasky.net](https://siasky.net) portal).

![Screenshot of Pull Request notification](screenshot.png)

**Caveat:** This action will only comment on a pull request coming from same account/organization. If the pull request is from a forked repo, this action will not be able to create a comment due to limited permissions but you will still be able to drill down the action logs and access the skylink and deploy url manually.

## Inputs

### `upload-dir`

**Required** Directory to upload (usually `build`, `dist`, `out` or `public`).

This action requires the upload directory to be already available so you will need to run the build step before running this action.

### `github-token`

**Required** Your github token that is required to authenticate posting a comment on pull request.

Find out more about github token from [documentation](https://docs.github.com/en/free-pro-team@latest/actions/reference/authentication-in-a-workflow).

### `registry-seed`

You can provide a seed (keep it secret, keep it safe) and this action will set corresponding skynet registry entry value to the deployed resolver skylink.

Public link to the registry entry will be printed in the action log.

### `registry-datakey`

Default value: `skylink.txt`

You can define custom datakey for a registry entry when used with `registry-seed`. Change only if you want to use a specific key, default value will work in all other cases.

### `portal-url`

Default value: `https://siasky.net`

You can override default skynet portal url with any compatible community portal or self hosted one.

## Outputs

### `skylink`

The resulting skylink.

Example: `sia://IAC6CkhNYuWZqMVr1gob1B6tPg4MrBGRzTaDvAIAeu9A9w`

### `skylink-url`

The resulting skylink url (base32 encoded skylink in subdomain).

Example: `https://400bk2i89lheb6d8olltc2grqgfaqfge1im134ed6q1ro0g0fbnk1to.siasky.net`

### `resolver-skylink`

A resolver skylink pointing at the resulting skylink. Resolver skylink will remain the same throughout the deploys, but will always resolve to the latest deploy.

Example: `sia://AQDwh1jnoZas9LaLHC_D4-2yP9XYDdZzNtz62H4Dww1jDA`

### `resolver-skylink-url`

The resulting resolver skylink url (base32 encoded skylink in subdomain). Resolver skylink will remain the same throughout the deploys, but will always resolve to the latest deploy.

Example: `https://040f11qosugpdb7kmq5hobu3sfmr4fulr06tcspmrjtdgvg3oc6m630.siasky.net/`

## Example usage

```yaml
uses: SkynetLabs/deploy-to-skynet-action@v2

with:
  upload-dir: public
  github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Full workflow example

```yaml
name: My CI Pipeline

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 16.x

      - name: Install dependencies
        run: yarn

      - name: Build webapp
        run: yarn build

      - name: Deploy to Skynet
        uses: SkynetLabs/deploy-to-skynet-action@v2

        with:
          upload-dir: public
          github-token: ${{ secrets.GITHUB_TOKEN }}
          registry-seed: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' && secrets.REGISTRY_SEED || '' }}
```

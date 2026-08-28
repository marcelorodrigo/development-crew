# npm Trusted Publishing

The package is published by GitHub Actions through npm trusted publishing. No
long-lived `NPM_TOKEN` is required.

## One-time npmjs.com setup

A package maintainer must configure the trusted publisher on the npm package
settings page:

1. Open <https://www.npmjs.com/package/@marcelorodrigo/opencode-development-crew>.
2. Open **Settings** and find **Trusted Publishers**.
3. Add **GitHub Actions** as the publisher.
4. Set **Organization or user** to `marcelorodrigo`.
5. Set **Repository** to `development-crew`.
6. Set **Workflow filename** to `publish.yml`.
7. Leave **Environment name** blank because this workflow does not use a GitHub environment.
8. Select **npm publish** as the allowed action.
9. Save the trusted publisher configuration.

Enter only the workflow filename, not the `.github/workflows/` directory. The
filename must include the `.yml` extension. Authorize `publish.yml`, not
`release-please.yml`: `publish.yml` checks out the published `vX.Y.Z` release
and runs `npm publish --access public`.

The workflow requests `id-token: write`, which allows npm to verify the GitHub
Actions OIDC identity and generate provenance for the published package.

## Release Please setup

Configure a repository secret named `RELEASE_PLEASE_TOKEN`. It must be a
GitHub token or GitHub App token that can create and update pull requests,
create releases, and push tags. The separate `release.published` event must be
created with this non-default token so it can trigger `publish.yml`.

## First release verification

After the next Release Please release is published, confirm the GitHub Actions
run for **Publish package** succeeded, the npm version matches the GitHub
release tag, provenance is present, and the tarball contains the OpenCode
plugin, skills, and hooks.

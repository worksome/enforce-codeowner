# Enforce Codeowner

This action is to enforce `CODEOWNERS` entries on PR files.

## Inputs

### `codeOwnersPath`

The path to the `CODEOWNERS` file in the repository. The default value is `.github/CODEOWNERS`.

### `commentPrefix`

The message prefix to post on the PR.

### `commentSuffix`

The message suffix to post on the PR.

### `checkboxes`

Enable checkboxes when listing the files in the comment. The default value is `false`.

### `includeDeleted`

Enable the inclusion of deleted files when checking for code owners. The default value is `false`.

### `ignoredFiles`

Ignore specific files using a new-line-separated list of files.

### `token`

The token used to authenticate with GitHub and post the comments on the PR. Defaults to `github.token`.

## Outputs

### `comment`

The output comment that should be posted on the pull request.

## Example usage

### Using the main action (will not post comments)

```yaml
- name: Enforce Codeowners
  id: enforce-codeowners
  uses: worksome/enforce-codeowner@v1
  with:
    codeOwnersPath: '.github/CODEOWNERS'
    commentPrefix: |
      The following files do not have code owners:
    commentSuffix: ''
    checkboxes: true
    includeDeleted: false
    ignoredFiles: |
      README.md
      composer.json
    token: ${{ github.token }}
```

### Using the composite action

```yaml
- name: Enforce Codeowners
  id: enforce-codeowners
  uses: worksome/enforce-codeowner/composite/with-comment@v1
  with:
    codeOwnersPath: '.github/CODEOWNERS'
    commentPrefix: |
      The following files do not have code owners:
    commentSuffix: ''
    checkboxes: true
    includeDeleted: false
    ignoredFiles: |
      README.md
      composer.json
    token: ${{ github.token }}
```

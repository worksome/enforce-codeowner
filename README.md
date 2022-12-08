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

### `token`

The token used to authenticate with GitHub and post the comments on the PR. Defaults to `github.token`.

## Example usage

```yaml
- name: Enforce Codeowners
  uses: worksome/enforce-codeowner@v1
  with:
    codeOwnersPath: '.github/CODEOWNERS'
    commentPrefix: |
      The following files do not have code owners:
    commentSuffix: ''
    token: {{ secrets.GITHUB_TOKEN }}
```

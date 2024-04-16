# Subrepo script

This script wraps the [git-subrepo](https://github.com/ingydotnet/git-subrepo) commands, to resolve an issue where rebasing/squashing commits on the container repository would create a stale `.gitrepo` parent sha, which would make `git subrepo` commands fail. It resolves it by detecting if the parent sha is stale, and if so, updates it with the parent commit of the `.gitrepo` file (ie, the parent commit from `git log --format=%P --follow -1 ${subRepoFolder}/.gitrepo`).

It also removes the need to add the subrepo folder in all commands, as it is hardcoded in, in `cli.ts`.

## Usage

Run this script with

```
# npm
npx tsx [shared-repo-folder]/scripts/subrepo [push | pull | check] [--verbose]

# yarn
yarn run tsx [shared-repo-folder]/scripts/subrepo [push | pull | check] [--verbose]
```

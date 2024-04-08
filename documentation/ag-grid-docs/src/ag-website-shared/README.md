# AG Website Shared

Shared code for all AG Grid websites ([AG Grid](https://github.com/ag-grid/ag-grid) and [AG Charts](https://github.com/ag-grid/ag-charts)).

## Usage

This repository is included in other repositories by using [git-subrepo](https://github.com/ingydotnet/git-subrepo). Once it is included, the people using the container repository does not need to know about `git-subrepo`, unless they need to push/pull updates from this repository.

### Prerequisites

1. To modify or update this repository from the container repository, install [git-subrepo](https://github.com/ingydotnet/git-subrepo) on your local machine. You do not need `git-subrepo` if you just need to push/pull directly to this repository
    1. `git clone https://github.com/ingydotnet/git-subrepo /path/to/git-subrepo`
    1. Add `source /path/to/git-subrepo/.rc` to your terminal rc file eg, `~/.zshrc` (see docs for others)
    1. Update `bash` if required: `brew install bash`
    1. Restart your terminal

### Installation

To install this shared repository into another container repository, run the following commands (NOTE: This only needs to be done once on the container repository).

1. In the container respository figure out the destination folder for this shared repository to go into (`[dest-folder]`), then run

    ```
    git subrepo clone git@github.com:ag-grid/ag-website-shared.git [dest-folder] -b latest --method rebase

    # Grid
    git subrepo clone git@github.com:ag-grid/ag-website-shared.git documentation/ag-grid-docs/src/ag-website-shared -b latest --method rebase

    # Charts
    git subrepo clone git@github.com:ag-grid/ag-website-shared.git packages/ag-charts-website/src/ag-website-shared -b latest --method rebase
    ```

1. In the website folder of the container repository, add the `@ag-website-shared/*` import alias to point to the `src` folder of this repository eg, if this repository is included in the `src/ag-website-shared` folder:

    ```
    // tsconfig.json
    {
      "compilerOptions": {
         "baseUrl": ".",
         "paths": {
           "@ag-website-shared/*": ["src/ag-website-shared/src/*"],
         }
      }
    }
    ```

    This allows all imports prefixed with `@ag-website-shared` to refer to files in this repository, whether it is imported in the container repository or this repository.

### Pull changes from this shared repository

In the container repository:

```
git subrepo pull [dest-folder]

# Grid
git subrepo pull documentation/ag-grid-docs/src/ag-website-shared

# Charts
git subrepo pull packages/ag-charts-website/src/ag-website-shared
```

### Backport changes from container repository to this shared repository

To backport changes from the container repository back to this shared repository:

1. Make commits to the container respository as normal.

    It doesn't matter if there are changes not related to the shared repository in the same commit, as they will be filtered out. However, it is good practice to make shared repository changes in separate commits.

1. Push changes from the container repository back to the shared repository:

    ```
    git subrepo push [dest-folder]

    # Grid
    git subrepo push documentation/ag-grid-docs/src/ag-website-shared

    # Charts
    git subrepo push packages/ag-charts-website/src/ag-website-shared
    ```

    If there are changes already on the shared repository, you will get the following error:

    ```
    git-subrepo: There are new changes upstream, you need to pull first.
    ```

    In which case, you should do a `git subrepo pull ...` first

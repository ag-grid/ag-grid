# AG Website Shared

Shared code for all AG Grid websites ([AG Grid](https://github.com/ag-grid/ag-grid) and [AG Charts](https://github.com/ag-grid/ag-charts)).

This code is hosted in the [ag-website-shared](https://github.com/ag-grid/ag-website-shared) repository and included in other repositories using [git-subrepo](https://github.com/ingydotnet/git-subrepo). Once it is included, the people using the container repository do not need to know about `git-subrepo`, unless they need to push/pull updates from this repository.

## Usage

### Prerequisites

1. To modify or update this repository from the container repository, install [git-subrepo](https://github.com/ingydotnet/git-subrepo) on your local machine. You do not need `git-subrepo` if you just need to push/pull directly to this repository
    1. `git clone https://github.com/ingydotnet/git-subrepo /path/to/git-subrepo`
    1. Add `source /path/to/git-subrepo/.rc` to your terminal rc file eg, `~/.zshrc` (see [docs](https://github.com/ingydotnet/git-subrepo?tab=readme-ov-file#command-completion) for other terminal environments)
    1. Update `bash` if required: `brew install bash`
    1. Restart your terminal

### Installation

To install this shared repository into another container repository, run the following commands (NOTE: This only needs to be done once, on the container repository).

1. In the container respository figure out the destination folder for this shared repository to go into (`[dest-folder]`), then run

    ```
    git subrepo clone git@github.com:ag-grid/ag-website-shared.git [dest-folder] -b latest --method rebase

    # Grid/Charts
    git subrepo clone git@github.com:ag-grid/ag-website-shared.git external/ag-website-shared -b latest --method rebase
    ```

1. In the website folder of the container repository, add the `@ag-website-shared/*` import alias to point to the `src` folder of this repository eg, if this repository is included in the `src/ag-website-shared` folder:

    ```
    // tsconfig.json
    {
      "compilerOptions": {
         "baseUrl": ".",
         "paths": {
           "@ag-website-shared/*": ["../../external/ag-website-shared/src/*"],
         }
      }
    }
    ```

    This allows all imports prefixed with `@ag-website-shared` to refer to files in this repository, whether it is imported in the container repository or this repository.

### Pull changes from this shared repository

In the container repository:

```
git subrepo pull [dest-folder]
```

⚠️ In grid/charts, there is a script that wraps the `git subrepo pull` command:

```
yarn run subrepo pull [--verbose]
```

### Updating this shared repository

There are 2 ways to update this shared repository:

1. Check out the [ag-website-shared](https://github.com/ag-grid/ag-website-shared) repository and git push/pull as normal
1. Backport changes from the container repository back to this shared repository:

    1. Make commits to the container respository as normal.

        It doesn't matter if there are changes not related to the shared repository in the same commit, as they will be filtered out. However, it is good practice to make shared repository changes in separate commits.

    1. Push changes from the container repository back to the shared repository:

        ```
        git subrepo push [dest-folder]
        ```

        ⚠️ In grid/charts, there is a script that wraps the `git subrepo push` command:

        ```
        yarn run subrepo pull [--verbose]
        ```

        If there are changes already on the shared repository, you will get the following error:

        ```
        git-subrepo: There are new changes upstream, you need to pull first.
        ```

        In which case, you should do a `git subrepo pull ...` first

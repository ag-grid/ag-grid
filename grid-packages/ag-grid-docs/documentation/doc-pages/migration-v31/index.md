---
title: "Upgrade to V31"
---

## What's new

See the [release post](about:blank) for details of what's new in this major version.

## Upgrading to V31

### Using the AG Grid migration tool

All major AG Grid releases now come with an accompanying migration tool to help automate the upgrade process. This is the easiest way to make sure your projects stay up-to-date with the latest AG Grid changes.

The migration tool fixes your project's codebase to address any breaking changes and deprecations when upgrading from an older version. This is achieved via codemods, which are small scripts that amend your project's source files to apply any necessary fixes.

To get started, first determine your currently-installed AG Grid version by looking in your project's `package.json`:

```json
{
    "dependencies": {
        "ag-grid-community": "30.2.1"
    }
}
```

Once you know the version you are upgrading from, you can follow these steps to run the AG Grid migration tool to prepare for upgrading to version 31:

1. Open a terminal and navigate to your current project's root folder

2. Run AG Grid migration tool with the `--from` argument set to the existing version from your `package.json`:

    ```
    npx @ag-grid-community/cli@31.0.0 migrate --from=30.2.1
    ```

    This will update your project's source files to prepare for the new release.

    The `@31.0.0` version number indicates that we will apply the changes required to upgrade to version 31.

<note>
The migration tool will check the state of your project to ensure that you don't lose any work. If you would rather see a diff of the changes before applying them, pass the `--dry-run` argument.
</note>

3. Once the migration tool has completed successfully, you're ready to upgrade the AG Grid dependency:

    ```bash
    npm install ag-grid-community@31.0.0
    ```

Caveats to bear in mind when using the migration tool:

- As with any automated codemod tool, we recommend that you check over any changes made by the migration tool before committing updated source files to your codebase
- In particular, any automatically-applied changes should always be logically correct, however the formatting of the generated code is likely to vary slightly from the rest of your codebase and could require minor tweaking
- While we attempt to automate as many upgrade paths as possible, unusual use cases may still require some manual intervention

### Breaking changes

This release includes the following breaking changes:

### Deprecations

This release includes the following deprecations:

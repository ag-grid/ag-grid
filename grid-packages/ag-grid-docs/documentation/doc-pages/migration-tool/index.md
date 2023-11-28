---
title: "Automatic migration tool"
---

## How do I upgrade my AG Grid version?

All major AG Grid releases from v31 onwards come with an accompanying migration tool to help automate the upgrade process. This is the easiest way to make sure your projects stay up-to-date with the latest AG Grid changes.

The migration tool fixes your project's codebase to address the majority of breaking changes and deprecations when upgrading from an older version. This is achieved via codemods, which are small scripts that amend your project's source files to apply any necessary fixes.

## Which frameworks are covered?

The migration tool currently supports projects that use the following AG Grid implementations:

- React
- JavaScript

It also includes partial support for the following frameworks (full support coming soon):

- Angular
- Vue

##  Using the automatic migration tool

Follow these steps to upgrade your project's AG Grid version to the latest version (currently `31.0.0`):

1. Open a terminal and navigate to your project's root folder

2. Update any AG Grid dependencies present in your project's `package.json` to version `31.0.0`:

    ```
    npm install ag-grid-community@31.0.0
    npm install ag-grid-enterprise@31.0.0
    npm install ag-grid-community/core@31.0.0
    # ...etc
    ```

3. Run version `31.0` of the AG Grid migration tool:

    ```
    npx @ag-grid-community/cli@31.0 migrate
    ```

    This will update your project's source files to prepare for the new release.

    By default the migration tool will locate all source files within the current directory. For projects with more specific requirements, pass a list of input files to the `migrate` command, or specify the `--help` argument to see more fine-grained usage instructions.

<note>
The migration tool will check the state of your project to ensure that you don't lose any work. If you would rather see a diff of the changes instead of applying them, pass the `--dry-run` argument.
</note>

##  Caveats

Some points to bear in mind when using the migration tool:

- As with any automation workflow, we recommend that you check over any changes made by the migration tool before committing updated source files to your codebase
- In particular, any automatically-applied changes should always be logically correct, however the formatting of the generated code is likely to vary slightly from the rest of your codebase and could require minor tweaking
- While we attempt to automate as many upgrade paths as possible, unusual use cases may still require some manual intervention

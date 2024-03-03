---
title: "Codemods"
---

## How to Upgrade AG Grid Version

All major AG Grid releases from v31 onwards come with an accompanying Codemod to help automate the upgrade process. Codemods are small scripts that fix your project's source files to address the majority of breaking changes and deprecations when upgrading from an older version.

This is the easiest way to make sure your projects stay up-to-date with the latest AG Grid changes.

## Framework Coverage

Codemods are fully supported for projects that use the following AG Grid implementations:

- React
- JavaScript

Codemods are partially supported for the following frameworks (full support coming soon):

- Angular - *currently doesn't apply edits within component template source*
- Vue - *currently doesn't apply edits within component template source*

## Notes

Some points to bear in mind when using Codemods:

- As with any automation workflow, we recommend that you check over any changes made by the codemods before committing updated source files to your codebase.
- In particular, any automatically-applied changes should always be logically correct, however the formatting of the generated code is likely to vary slightly from the rest of your codebase and could require minor tweaking.
- While we attempt to automate as many upgrade paths as possible, unusual use cases may still require some manual intervention.

See the relevant migration documentation page for more information on the Codemod for a specific AG Grid version.

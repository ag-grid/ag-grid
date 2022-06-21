---
title: "Upgrading from the Legacy Sass API"
---

The Legacy Sass API is deprecated and will be removed from the Grid in a future major release. The new API has been designed to be easy to upgrade to - it supports almost the same set of properties as the old API, with a few minor differences documented below. 

[[warning]]
| If you upgrade an app from v27 to 28 you will be automatically opted in to the Legacy API. Follow the instructions in this document to upgrade.

### Benefits of the new API

1. Long-term stability and feature completeness. The Legacy API is being kept around for at least one major version in order to allow a grace period where customers can continue using the old API if they encounter issues with the new one. But the new API is the future, and as we add new features in future minor releases these may not be fully supported by the legacy API.
2. Extensive CSS variable support. Any style property can be overridden at runtime with CSS variables.
3. Applications using multiple themes will see a significant reduction in CSS size. For example if you use both Alpine and Alpine Dark, you'll see a 50% size reduction, as the two themes share 99% of their code and only differ in the variables they define.
4. Better validation to catch accidental passing of invalid parameter values.
5. Faster compile times.

## Upgrade instructions

In order to upgrade, you need to:

1. Alter the import paths to include the new API rather than the legacy API
2. Pass your theme parameters to the new `grid-styles` mixin instead of the `ag-theme-themename` mixin
3. Check the list of breaking changes below and see if you need to change any parameter values

### Altering your Sass import paths and using the grid-styles mixin

```scss
// Legacy API
@import "~ag-grid-community/src/styles/ag-grid.scss";
@import "~ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine-mixin.scss";
.ag-theme-alpine {
  @include ag-theme-alpine((
    alpine-active-color: red
  ))
}

// NOTE: Depending on how you have configured your Sass build the import paths may be
// prefixed with `@`, `~`, or a relative path to `node_modules`. Keep the same style
// of import. The above path is a sass-loader path (`~` prefix), so we edit it to:

// New API
@use "~ag-grid-community/styles" as ag;
// ^^^ Update the import path. Note that `@import` has changed to `@use {path} as {name}`
@include ag.grid-styles((
  // ^^^ Include ag.grid-styles which it is no longer nested  in .ag-theme-{name} {}
  theme: alpine,
  // ^^^ Add the theme name to the mixin
  alpine-active-color: red,
  // ^^^ Pass the same parameters. The new API validates parameters so you will be
  //     notified if any of the names or values you pass are not valid for the new API
));
```

In the above example the Alpine theme is modified but not renamed. If you have renamed the theme, use the new `extend-theme` parameter:

```scss
// Renaming Alpine ag-theme-custom-name in the Legacy API
.ag-theme-custom-name {
  @include ag-theme-alpine((
    alpine-active-color: red
  ))
}

// Renaming Alpine ag-theme-custom-name in the new API
@include ag.grid-styles((
  theme: custom-name,
  extend-theme: alpine,
  alpine-active-color: red,
));
```

### Breaking changes

We have tried to make the new Sass Styling API as backwards-compatible as possible, but there are a few breaking changes:

1. The backwards-compatibility layer introduced in v23 (released 2020) for the benefit of applications written for v22 and below has been removed. This is necessary in order to prepare for the [upcoming release of Sass in late 2022](https://github.com/sass/sass/blob/main/accepted/module-system.md#timeline) which will remove support for global variables. In practice, this means that if your application was initially created before March 2020 and you are still using the v22 method of configuring themes (setting global variables like `$ag-foreground-color: red;`) then you will need to switch to using the map-based configuration API that is shared by both the Legacy Sass API and the new Sass Styling API.
1. `borders-side-button` used to both add both a border to the side buttons (vertical tabs), and set the background color when the tab was selected. Not it only sets the border. Use `side-button-selected-background` to set the background color.
1. Removed `full-width-tabs`. This caused the tabs to expand to fill the space available and was used by the Material theme. If you need the same effect, use CSS:

    ```css
    .your-theme .ag-tab {
      flex: 1 1 auto;
    }
    ```

1. Removed `ag-param($param)`, a Sass function that was replaced at compile time with the value of `$param`, has been removed. All theme variables are now dynamic. Use `var` instead:

    ```scss
    // old way:
    .my-element {
      color: ag-param(foreground-color);
    }
    // new way:
    .my-element {
      color: var(--ag-foreground-color);
      // ^^^ note the --ag- prefix
    }
    ```
1. Removed `ag-color-property()`, a Sass mixin that outputted a CSS variables with a fallback for IE11, has been removed. It is no longer required now that IE11 is not a supported browser. Use `var` instead:

    ```scss
    // old way
    .my-element {
      @include ag-color-property(color, header-foreground-color);
    }
    // new way
    .my-element {
      color: var(--ag-header-foreground-color);
    }
    ```

1. Removed `%ag-text-input`, a Sass placeholder selector for styling text inputs, is now a mixin:

    ```scss
    // old way
    %ag-text-input {
      color: #999;
    }
    // new way
    @include ag.text-input {
      color: #999;
    }
    ```

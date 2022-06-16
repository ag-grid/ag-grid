---
title: "Upgrading from the Legacy Sass API"
---

The Legacy Sass API is deprecated and will be removed from the Grid in a future major release.

The new API has been designed to be easy to upgrade to - it supports the same properties and the old one. In order to upgrade, you need to:

1. Alter the import paths to include the new API rather than the legacy API
2. Pass your theme parameters to the new `grid-styles` mixin instead of the `ag-theme-themename` mixin
3. Check the list of breaking changes below and see if you need to change any parameter values

## Altering your Sass import paths and using the grid-styles mixin

```scss
// Legacy API
@import "~ag-grid-community/src/styles/ag-grid.scss";
@import "~ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine-mixin.scss";
.ag-theme-alpine {
  @include ag-theme-alpine((
    alpine-active-color: red
  ))
}

// New API
@use "~ag-grid-community/styles" as ag;
// ^^^ updated import path
@include ag.grid-styles((
  theme: alpine,
  // ^^^ pass the theme name here
  alpine-active-color: red,
));
// ^^^ use the -grid-styles mixin - note that it is no longer nested inside .ag-theme-alpine {}
```

## Breaking changes to the Sass API

We have tried to make the new Sass API as backwards-compatible as possible, but there are a few breaking changes:

1. The backwards-compatibility layer introduced in v23 (released 2020) for the benefit of applications written for v22 and below has been removed. This is necessary in order to prepare for the [upcoming release of Sass in late 2022](https://github.com/sass/sass/blob/main/accepted/module-system.md#timeline) which will remove support for global variables. In practice, this means that if your application was initially created before March 2020 and you are still using the v22 method of configuring themes (setting global variables like `$ag-foreground-color: red;`) then you will need to switch to using the map-based configuration API that is shared by both the legacy Sass API and the new Sass API. See the [v23 migration docs](https://www.ag-grid.com/archive/23.0.0/javascript-grid-themes-v23-migration/) for more information.
1. `borders-side-button` used to both add both a border to the side buttons (vertical tabs), and set the background color when the tab was selected. Not it only sets the border. Use `side-button-selected-background` to set the background color.
1. Removed `full-width-tabs`. This caused the tabs to expand to fill the space available and was used by the Material theme. If you need the same effect, use CSS:

    ```css
    .your-theme .ag-tab {
      flex: 1 1 auto;
    }
    ```

1. `ag-param($param)`, a Sass function that was replaced at compile time with the value of `$param`, has been removed. All theme variables are now dynamic. Use `var` instead:

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
1. `ag-color-property()`, a Sass mixin that outputted a CSS variables with a fallback for IE11, has been removed. It is no longer required now that IE11 is not a supported browser. Use `var` instead:

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

1. `%ag-text-input`, a Sass placeholder selector for styling text inputs, is now a mixin:

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

## Breaking change: class names for emitted themes

The Legacy Sass API allowed you to choose the class name that your theme was emitted under when using a provided theme. For example, you could extend the Alpine theme using the name `ag-theme-acmecorp-house-style` ...

```scss
.ag-theme-alpine {
  @include ag-theme-alpine((
    alpine-active-color: red
  ))
}
```

... and apply it like this:

```html
<!-- ag-theme-acmecorp-house-style includes Alpine styles
     and custom modifications -->
<div id="myGrid" class="ag-theme-acmecorp-house-style"></div>
```

If you created your app using the legacy Sass API and upgrade to the new API, you will find that the new API outputs CSS rules under the theme's class name rather than a custom class name (`.ag-theme-alpine` rather than `.ag-theme-acmecorp-house-style`). It is possible to reproduce the old behaviour, but first consider these alternatives:

1. If you have a single app, you can remove the custom theme name and apply the theme class name to your grid:

    ```html
    <div id="myGrid" class="ag-theme-alpine"></div>
    ```

2. If you have multiple apps you can create a [reusable package of design customisations](/customising-design#creating-a-reusable-package-of-design-customisations), but this will require updating the HTML of each app.

If you want to upgrade to the new Sass API while keeping the old style of custom theme names, in order to avoid the need to change you apps' HTML, you can use the Sass `@extend` rule:

```scss
// Use the Sass styling API as usual. This will emit styles for .ag-grid-alpine
@include ag.grid-styles((
  theme: alpine,
  odd-row-background-color: #aaa,
));
// alias all .ag-theme-alpine rules to your custom theme name
.ag-theme-acmecorp-house-style {
  @extend .ag-theme-alpine;
}
```
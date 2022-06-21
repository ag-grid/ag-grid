---
title: "Sass Styling API"
---

The Sass Styling API is an optional lightweight wrapper around [Themes](/themes) and [Design Customisations](/customising-design) that automates the process of importing CSS files and setting CSS variables.

Sass is not necessary to customise the provided themes. Since introducing full support for design customisation through CSS variables in v28, anything that is possible with Sass is also possible with CSS. But the Sass API provides some benefits:

1. **Colour blending.** The Sass API saves you the work of defining multiple related colours. For example with the Alpine theme, if you set `alpine-active-color` to `red` then the `row-hover-colour` will automatically be set to a light pink.
1. **Validation.** In the Sass API you will get a build error if you accidentally pass an invalid parameter name or value. In CSS this would be silent and lead to incorrect styling.
2. **Automatic selection of CSS files.** The Sass API ensures that only the necessary CSS files are loaded, only once, in the correct order, and combined into a single file.

## Getting started

First, set up your project to compile Sass (.scss) files. We provide examples for the major frameworks:

 - Vanilla JS and React: use the [Sass CLI](https://github.com/ag-grid/ag-grid-customise-theme/tree/v28-theme-refactor/src/vanilla) or [Webpack and sass-loader](https://github.com/ag-grid/ag-grid-customise-theme/tree/v28-theme-refactor/src/vanilla-webpack)
 - Angular: see our [Angular CLI](https://github.com/ag-grid/ag-grid-customise-theme/tree/v28-theme-refactor/src/angular) example
 - Vue: see our [Vue CLI](https://github.com/ag-grid/ag-grid-customise-theme/tree/v28-theme-refactor/src/vue) example

Next, create import the Sass API in your .scss file:

```scss
@use "ag-grid-community/styles" as ag;
```

The above import path assumes that `node_modules` is added to the Sass load path. Depending on how your project is configured, you may need to add one or more prefixes to the import path:

 - `@ag-grid-community/styles` if you're using the grid [modules](/modules/) feature
 - `node_modules/ag-grid-community/styles` if `node_modules` is not in the Sass load path
 - `~ag-grid-community/styles` is you're using webpack and sass-loader (the tilde instructs sass-loader to look in `node_modules`)

 [[note]]
| These import paths changed in v28. If you have created ag-Grid apps using v27 or below, ensure that you use the above import paths rather than copying the old v27 import paths, to avoid importing the [Legacy Sass API](/styling-sass-legacy/).

## Simple example

To emit all the styles you need for an ag-Grid application, include the `grid-styles` mixin:

```scss
@use "ag-grid-community/styles" as ag;
@include ag.grid-styles();
```

Because no theme is specified, it will default to Alpine. Compiling this file will select the `ag-grid.css` and `ag-theme-alpine.css` files from the grid distribution and combine them into the output. There is no need to separately include `ag-grid.css` in your build.

To use the theme, set the `ag-theme-alpine` class on your grid div:

```html
<div id="myGrid" class="ag-theme-alpine">
```

To customise the Alpine theme, you can add more parameters to the `grid-styles` mixin, as described in the rest of this page.

## Choosing a theme

Use the `theme` parameter to set the name of the outputted theme.

```scss
@use "ag-grid-community/styles" as ag;
@include ag.grid-styles(
    theme: balham
);
```

This can be either:

1. a [provided theme](/themes/) (`alpine`, `alpine-dark`, `balham`, `balham-dark` or `material`). The CSS file for the theme will automatically be included.
2. Any string of your choice to create a custom theme.

If you

## Setting CSS variables

The Sass Styling API is a wrapper around the CSS variable API for design customisation, you can pass any supported CSS variable as a parameter to the Sass API, just remove the `--ag-` prefix from the variable name. See the [full list of supported CSS variables](/customising-design#full-list-of-css-variables).

The Sass API provides a little bit of sugar to make it easier to read and remember some parameter values and assists migration from the [Legacy Sass API](/styling-sass-legacy/).

- You can pass `true` or `false` to any `borders-*` parameter to enable or disable the border (the equivalent CSS variables require `solid 1px` or `none`)
- You can pass `true` or `false` to the `header-column-separator-display` or `header-column-resize-handle-display` parameters (the equivalent CSS variables require `block` or `none`)
- You can pass `null` to any `*-color` parameter, which will be converted to a CSS value of `transparent`

## Colour blending

The grid relies extensively on transparency to look good. For example when the grid is loading its data and can't be interacted with, it will display a semi-transparent overlay on top of the user interface. In order to match the grid's colour scheme we usually want this overlay to be the same hue as the grid background.

CSS cannot automatically generate a transparent version a colour, so in CSS if you change the background colour of the grid you may also want to set the `--ag-modal-overlay-background-color` variable in order to update the overlay to the new colour scheme.

The Sass Styling API will do this for you. If you define a `background-color` and have not set an explicit value for `modal-overlay-background-color` then it will be set to the background color with an opacity of 66%.

The most important parameters for colour blending are:

- The foreground color (`foreground-color`). Setting this will create a default color for many ordinary elements of the grid such as borders, header text and disabled text styles.
- The theme active color (`alpine-active-color` for Alpine or `balham-active-color` for Balham). Setting this will create defaults for visual elements that should stand out, such as selected rows, checked checkboxes, and cell range selections.

As an example of color blending in action, the following Sass file:

```scss
@use "ag-grid-community/styles" as ag;
@include ag.grid-styles((
    theme: alpine,
    alpine-active-color: red
));
```

will compile to this CSS:

```css
/* ... content of ag-grid.css ... */
/* ... content of ag-theme-alpine.css ... */
.ag-theme-alpine {
  --ag-alpine-active-color: red;
  --ag-range-selection-border-color: red;
  --ag-selected-row-background-color: rgba(255, 0, 0, 0.1);
  --ag-row-hover-color: rgba(255, 0, 0, 0.1);
  --ag-column-hover-color: rgba(255, 0, 0, 0.1);
  --ag-input-focus-border-color: rgba(255, 0, 0, 0.4);
  --ag-range-selection-background-color: rgba(255, 0, 0, 0.2);
  --ag-range-selection-background-color-2: rgba(255, 0, 0, 0.36);
  --ag-range-selection-background-color-3: rgba(255, 0, 0, 0.488);
  --ag-range-selection-background-color-4: rgba(255, 0, 0, 0.5904);
}
```

## Multiple themes

You can use multiple themes. This is useful for projects that allow the end user to select a theme. In simple use cases where each theme has the same configuration you can pass an array of theme names to the `themes` parameter.

```scss
@use "ag-grid-community/styles" as ag;
@include ag.grid-styles((
    themes: (alpine, alpine-dark),
    alpine-active-color: red
));
```

If each theme needs a different configuration, `themes` can be a map of theme name to additional configuration:

```scss
@use "ag-grid-community/styles" as ag;
@include ag.grid-styles((
    themes: (
        alpine: (
            header-background-color: rgb(234, 191, 177),
        ),
        alpine-dark: (
            header-background-color: rgb(72, 44, 17),
        )
        // ^^^ different header background for each theme
    ),
    alpine-active-color: red
    // ^^^ but the same active colour
));
```

## Suppressing native widget styles

The default styles in `ag-grid.css` use CSS to style native inputs - checkboxes, radio buttons and range sliders. These default styles can be customised using the `checkbox-*` and `toggle-button-*` parameters. If you want to use the browser's default UI or create your own then it's easier to start from a blank slate rather than attempting to override the default styles.

Setting `suppress-native-widget-styling` to `true` will use `ag-grid-no-native-widgets.css` instead of `ag-grid.css`, turning off all default styles for native widgets.

## Extending a provided theme

If you want to use a provided theme (say alpine), apply some customisations, and package this as a custom theme to share between multiple apps, then you may want to use a different theme name.

To do this, set the `theme` parameter to your custom theme and the `extend-theme` parameter to one of the provided themes:

```scss
@use "ag-grid-community/styles" as ag;
@include ag.grid-styles((
    theme: acmecorp,
    extend-theme: alpine,
    alpine-active-color: red
));
```

To use this theme, add the `ag-theme-acmecorp` class to your grid div.

Theme extension is only available in the Sass API. The alternative method of creating a [reusable package of design customisations](/customising-design#creating-a-reusable-package-of-design-customisations) works in both Sass and pure CSS projects.

Theme extension works with multiple themes too, set the `extend-theme` parameter at the theme level:

```scss
@use "ag-grid-community/styles" as ag;
@include ag.grid-styles((
    themes: (
        acmecorp: (extend-theme: alpine),
        acmecorp-dark: (extend-theme: alpine-dark),
    ),
    alpine-active-color: red
));
```

[[note]]
| `extend-theme` internally uses the Sass `@extend` rule, which generates new selectors for `.ag-theme-acmecorp` while leaving the original selectors for `.ag-theme-alpine` intact. This slightly increases the output of the compiled CSS, but the difference is likely to be too small to measure in real world conditions (less than 1kb gzipped)
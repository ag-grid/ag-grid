---
title: "Provided Themes"
---

The grid comes with several provided themes which act as a great starting point for any application-specific customisations.

## Themes Summary

The table below provides a summary of the themes provided with the grid. To see the themes in action take a look at our [Demo Application](../../example)
and try switching between the available themes.

## Applying a Theme to an App

To use a theme, add the theme class name to the `div` element that contains your grid. The following is an example of using the Alpine theme:

```html
<div id="myGrid" class="ag-theme-alpine"></div>
```

In order for the above code to work, the correct stylesheets must be loaded:

### Loading Provided Themes

There are two kinds of stylesheet that need to be loaded when using provided themes:

- **`ag-grid.css`** - structural styles containing CSS rules that are essential to the functioning of the grid.
- **`ag-theme-{theme-name}.css`** - theme styles that add design look and feel on top of the structural styles.

[[note]]
| Both stylesheets need to be included with the structural styles (`ag-grid.css`) loaded before theme styles (`ag-theme-{theme-name}.css`).

There are various ways to load these stylesheets, as described in the sections below:

[[only-javascript]]
| ### Pre-built Bundles
|
| Some pre-built bundles, whether [downloaded from our website](/download/) or included in the `ag-grid-community` [NPM package](/npm/), already embed the structural styles and all provided themes. If you are using one of these files, you do not need to load separately CSS.

### JavaScript Bundlers

If you are using a JavaScript bundler like webpack or Rollup and it is configured to load styles, you can `require()` the correct CSS file from `node_modules`. This is the recommended approach as webpack will take care of minifying your CSS in production.

### App Hosted

You can copy, either manually or as part of your app's build, the required CSS files (`ag-grid.css` and `ag-theme-{theme-name}.css`) from node_modules and serve it with your app.

### CDN

You can load the structural styles and theme from a free CDN by adding this code to your page.

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@ag-grid-community/core@@AG_GRID_VERSION@/dist/styles/ag-grid.css" />

<link
  rel="stylesheet"
  href="https://unpkg.com/@ag-grid-community/core@@AG_GRID_VERSION@/dist/styles/ag-theme-alpine.css" />
```

[[note]]
| Change the theme name in the URL to the one that you're using, and ensure that the version number in the URL matches the JS version you're using. This is useful for testing and prototyping but not recommended for production as your app will be unavailable if the unpkg servers are down.

## Loading the Roboto font for Material theme

The Material theme requires the Roboto font, and this is not bundled in the material CSS. The easiest way to load Roboto is through Google's CDN:

```html
<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />
<div id="myGrid" class="ag-theme-material"></div>
```

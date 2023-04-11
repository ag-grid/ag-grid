---
title: "Themes"
---

The grid is styled with CSS, and a theme is simply a CSS class that applies styles to the grid. Most users choose a provided theme and then [customise](/global-style-customisation/) it to meet their needs. It is also possible to [create your own themes](#creating-your-own-theme).

## Provided Themes

The grid comes with several provided themes which act as a great starting point for any application-specific customisations. Click the theme name to see a demo.

| Theme Name | Description |
|------------|-------------|
|[**ag-theme-alpine**](../../example?theme=ag-theme-alpine)<br/>[**ag-theme-alpine-dark**](../../example?theme=ag-theme-alpine-dark)<br/><br/>File name `ag-theme-alpine[.min].css` | Modern looking themes with high contrast, and generous padding. <br/><br/>**Recommendation:** This is the recommended grid theme and an excellent choice for most applications. |
|[**ag-theme-balham**](../../example?theme=ag-theme-balham)<br/>[**ag-theme-balham-dark**](../../example?theme=ag-theme-balham-dark)<br/><br/>File name `ag-theme-balham[.min].css` | Themes for professional data-heavy applications.<br/><br/>**Recommendation:** Balham was the recommended theme before Alpine was developed. It is still an excellent choice for applications that need to fit more data onto each page. |
|[**ag-theme-material**](../../example?theme=ag-theme-material)<br/><br/>File name `ag-theme-material[.min].css` | A theme designed according to the Google Material Language Specs.<br/><br/>**Recommendation:** This theme looks great for simple applications with lots of white space, and is the obvious choice if the rest of your application follows the Google Material Design spec. However, the Material spec doesn't cater for advanced grid features such as grouped columns and tool panels. If your application uses these features, consider using `ag-theme-alpine` instead. |

## Applying a Theme to an App

To use a theme, add the theme class name to the `div` element that contains your grid. The following is an example of using the Alpine theme:

```html
<div id="myGrid" class="ag-theme-alpine"></div>
```

<warning>
| The grid must always have a theme class set on its container, whether this is a provided theme or your own.
</warning>

## Loading CSS files

In order for the above code to work, the correct stylesheets must be loaded in the correct order. There are two kinds of stylesheet that need to be loaded when using provided themes:

- **`ag-grid.css`** - structural styles containing CSS rules that are essential to the functioning of the grid and must be loaded first.
- **`ag-theme-{theme-name}.css`** - theme styles that add design look and feel on top of the structural styles.

<note>
| The correct files to load are located in `ag-grid-community/styles` or `@ag-grid-community/styles` if you're using [modules](/modules/).
|
| This path has changed in v28, and the old files are still there as part of the [Legacy Styles](/global-style-upgrading-to-v28/) but will be removed in v29.
|
| Double-check that you are importing files from the new paths. If you have `/src/` or `/dist/` in your path then you're using the old paths.
</note>

There are various ways to load these stylesheets, as described in the sections below:

<framework-specific-section frameworks="javascript">
|### Pre-built Bundles
|Some pre-built bundles, whether [downloaded from our website](/download/) or included in the `ag-grid-community` [NPM package](/npm/), already embed the structural styles and all provided themes. If you are using one of these files, you do not need to load separately CSS.
</framework-specific-section>

### JavaScript Bundlers

If you are using a JavaScript bundler like webpack or Rollup and it is configured to load styles, you can `require()` the correct CSS file from `node_modules`. This is the recommended approach as webpack will take care of minifying your CSS in production:

```js
// CommonJS:
require("ag-grid-community/styles/ag-grid.css");

// ECMAScript Modules:
import "ag-grid-community/styles/ag-grid.css";
```

### App Hosted

You can copy, either manually or as part of your app's build, the required CSS files (`ag-grid.css` and `ag-theme-{theme-name}.css`) from node_modules and serve it with your app.

### Sass Styling API

If you're using the [Sass Styling API](/global-style-customisation-sass) then the right CSS files will be automatically included for your chosen theme. For projects that are already using Sass this is the recommended approach.

### CDN

You can load the structural styles and theme from a free CDN by adding this code to your page.

```html
<link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/ag-grid-community@@AG_GRID_VERSION@/styles/ag-grid.css" />

<link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/ag-grid-community@@AG_GRID_VERSION@/styles/ag-theme-alpine.css" />
```

<note>
| Change the theme name in the URL to the one that you're using, and ensure that the version number in the URL matches the JS version you're using. This is useful for testing and prototyping but not recommended for production as your app will be unavailable if the jsdelivr servers are down.
</note>

### Loading the Roboto font for Material theme

The Material theme requires the Roboto font, and this is not bundled in the material CSS. The easiest way to load Roboto is through Google's CDN:

```html
<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />
<div id="myGrid" class="ag-theme-material"></div>
```

## Creating your own theme

The majority of users select a provided theme and [make customisations using CSS](/global-style-customisation/). If your chosen provided theme has elements that you don't want, you will need to add CSS rules to remove them. If your desired look and feel is very different from the provided theme, at some point it becomes easier to start from scratch. To do this, you can define your own theme.

A theme is simply a CSS class name matching the pattern `ag-theme-*`, along with CSS rules that target this class name.

Ensure that `ag-grid.css` is loaded, choose a theme name and apply it to the grid:

```html
<div id="myGrid" class="ag-theme-mycustomtheme"></div>
```

That's it! You've created a theme. You haven't added any styles to it so what you will see is a nearly blank slate - basic customisable borders and padding but no opinionated design elements. You can then [add customisations using CSS](/global-style-customisation/):

```css
.ag-theme-mycustomtheme {
    /* customise with CSS variables */
    --ag-grid-size: 8px;
    --ag-border-color: red;
}
.ag-theme-mycustomtheme .ag-header {
    /* or with CSS selectors targeting grid DOM elements */
    font-style: italic;
}
```

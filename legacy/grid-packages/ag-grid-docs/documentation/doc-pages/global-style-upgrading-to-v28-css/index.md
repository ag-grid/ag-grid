---
title: "Upgrading from the Legacy CSS files"
---

The Legacy CSS files are deprecated and will be removed from the Grid in a future major release. The new CSS files are 100% backwards compatible and upgrading should be as simple as changing an import path.

<warning>
| If you upgrade an app from v27 to v29+ without changing the import paths for CSS and Sass (.scss) files then the paths will be invalid and the themes won't work.
| 
| Follow the instructions in this document to upgrade.
</warning>

## Updating the CSS import paths

There are many ways to import CSS, but however you are doing this in your app you need to delete the `/dist` part from the path. For example if you're using the jsdelivr CDN:

### Packages

<snippet transform={false} language="html">
&lt;!-- old path -->
&lt;link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/ag-grid-community@@AG_GRID_VERSION@/dist/styles/ag-grid.css" />
</snippet>

<snippet transform={false} language="html">
&lt;!-- new path -->
&lt;link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/ag-grid-community@@AG_GRID_VERSION@/styles/ag-grid.css" />
</snippet>

### Modules

If you are using [Grid Modules](/modules/) then you will need to use the new `@ag-grid-community/styles` module.

<snippet transform={false} language="html">
&lt;!-- old path -->
&lt;link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@ag-grid-community/core@@AG_GRID_VERSION@/dist/styles/ag-grid.css" />
</snippet>

<snippet transform={false} language="html">
&lt;!-- new path -->
&lt;link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@ag-grid-community/styles@@AG_GRID_VERSION@/ag-grid.css" />
</snippet>

<framework-specific-section frameworks="javascript">
| ### Bundled Files
|
| If you are using an [AG Grid Bundle](/download/#download-ag-grid-bundle) where the themes are included in the `.js` file, all **CSS Variables** need to be set after the bundle has been imported, as follows: 
|
</framework-specific-section>

<snippet transform={false} language="html">
| &lt;!DOCTYPE html>
| &lt;html lang="en">
|     &lt;head>
|         &lt;title>AG Grid&lt;/title>
|         &lt;meta charset="UTF-8" />
|         &lt;meta name="viewport" content="width=device-width, initial-scale=1" />
|     &lt;/head>
|     &lt;body>
|     &lt;div id="myGrid" class="ag-theme-alpine">&lt;/div>
|     &lt;script src="//https://cdn.jsdelivr.net/npm/browse/ag-grid-community@@AG_GRID_VERSION@/dist/ag-grid-community.min.js">&lt;/script>
|     &lt;!-- Style added after AG Grid bundle -->
|     &lt;style>
|         .ag-theme-alpine {
|             --ag-foreground-color: deeppink;
|             --ag-header-column-separator-color: orange;
|          }
|     &lt;/style>
|     &lt;script src="main.js">&lt;/script>
|     &lt;/body>
| &lt;/html>
</snippet>

## Dark themes

In v27 there were separate CSS files for the light and dark versions of provided themes, e.g. `ag-theme-alpine.css` and `ag-theme-alpine-dark.css`.

In v28 both light and dark versions of themes are included in one file, so if you were previously including `ag-theme-alpine-dark.css`, change it to `ag-theme-alpine.css`. If you were previously including both files, remove the dark file.

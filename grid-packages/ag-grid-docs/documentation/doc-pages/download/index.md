---
title: "Download AG Grid"
frameworks: ["javascript"]
---

If your project does not use package manager and you don't want to refer AG Grid from CDN,
you can download the AG Grid's source files and keep them in your project structure.


[[note]]
| **Disclaimer:** This makes upgrading more complex and prone to errors. We recommend using AG Grid
| from an NPM package or from CDN.

## Download AG Grid bundle

You can download AG Grid from the `dist` folder of the AG Grid [GitHub Repository](https://github.com/ag-grid/ag-grid/tree/v@AG_GRID_VERSION@/grid-packages/ag-grid-community/dist).

There are four bundle files in the distribution:

- `dist/ag-grid-community.js` — standard bundle containing JavaScript and CSS
- `dist/ag-grid-community.min.js` — minified bundle containing JavaScript and CSS
- `dist/ag-grid-community.noStyle.js` — standard bundle containing JavaScript without CSS
- `dist/ag-grid-community.min.noStyle.js` — minified bundle containing JavaScript without CSS

Should you decide to use the `noStyle` versions of the bundle, the stylesheet files are present in the `dist/styles` folder.

## Download AG Grid Enterprise bundle

You can download AG Grid Enterprise from the `dist` folder of the AG Grid Enterprise [Github Repository](https://github.com/ag-grid/ag-grid/tree/v@AG_GRID_VERSION@/grid-packages/ag-grid-enterprise/dist).

Again there are four bundle files in the distribution:

- `dist/ag-grid-enterprise.js` — standard bundle containing JavaScript and CSS
- `dist/ag-grid-enterprise.min.js` — minified bundle containing JavaScript and CSS
- `dist/ag-grid-enterprise.noStyle.js` — standard bundle containing JavaScript without CSS
- `dist/ag-grid-enterprise.min.noStyle.js ` — minified bundle containing JavaScript without CSS

Should you decide to use the `noStyle` versions of the bundle, you should use the style files from
the AG Grid bundle (all the styles needed for community and enterprise are in the community CSS files).


After downloading the bundles, you can refer to the files in the same way as you would from CDN. Refer [the getting started section](/getting-started/) for step-by-step guide on that.


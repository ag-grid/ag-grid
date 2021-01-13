---
title: "Download ag-Grid"
frameworks: ["javascript"]
---

If your project does not use package manager and you don't want to refer ag-Grid from CDN, 
you can download the ag-Grid's source files and keep them in your project structure.


[[note]]
| **Disclaimer:** This makes upgrading more complex and prone to errors. We recommend using ag-Grid 
| from an NPM package or from CDN.

## Download ag-Grid bundle

You can download ag-Grid from the `dist` folder of the ag-Grid [GitHub Repository](https://github.com/ag-grid/ag-grid/tree/master/community-modules/all-modules/dist).

There are four bundle files in the distribution:

- `dist/ag-grid-community.js` — standard bundle containing JavaScript and CSS
- `dist/ag-grid-community.min.js` — minified bundle containing JavaScript and CSS
- `dist/ag-grid-community.noStyle.js` — standard bundle containing JavaScript without CSS
- `dist/ag-grid-community.min.noStyle.js` — minified bundle containing JavaScript without CSS

Should you decide to use the `noStyle` versions of the bundle, the stylesheet files are present in the `dist/styles` folder.

## Download ag-Grid Enterprise bundle

You can download ag-Grid Enterprise from the `dist` folder of the ag-Grid Enterprise [Github Repository](https://github.com/ag-grid/ag-grid/tree/master/enterprise-modules/all-modules/dist).

Again there are four bundle files in the distribution:

- `dist/ag-grid-enterprise.js` — standard bundle containing JavaScript and CSS
- `dist/ag-grid-enterprise.min.js` — minified bundle containing JavaScript and CSS
- `dist/ag-grid-enterprise.noStyle.js` — standard bundle containing JavaScript without CSS
- `dist/ag-grid-enterprise.min.noStyle.js ` — minified bundle containing JavaScript without CSS

Should you decide to use the `noStyle` versions of the bundle, you should use the style files from 
the ag-Grid bundle (all the styles needed for community and enterprise are in the community CSS files).


After downloading the bundles, you can refer to the files in the same way as you would from CDN. Refer [the getting started section](../getting-started/) for step-by-step guide on that.


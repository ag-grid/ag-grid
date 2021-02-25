---
title: "Install AG Grid with NPM"
frameworks: ["javascript"]
---

AG Grid is available through NPM packages. Below is a code example of using AG Grid with NPM and ECMA 6 imports.

To install AG Grid and update your `package.json` file run:

```bash
npm install --save ag-grid-community
```

To install AG Grid Enterprise and update your `package.json` file run:


```bash
npm install --save ag-grid-enterprise
```

Afterwards, depending on your project setup, you can either `require` or `import` the module. For ag-grid, you need the ag-grid module:

```js
// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid-community');

// ECMA 6 - using the system import method
import { Grid } from 'ag-grid-community';
```

For AG Grid Enterprise features, import the `ag-grid-enterprise` package for it to be included in your application:

```js
import 'ag-grid-enterprise'
```

After you have loaded the scripts, you should include the styles in your project. There are several
ways to do it, depending on your module bundler and the specifics of your project. The stylesheet
files reside in `dist/styles/` directory of the ag-grid package - you should include `ag-grid.css`
and the theme of your choice.

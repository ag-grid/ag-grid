---
title: "Building AG Grid with Rollup.js"
frameworks: ["javascript"]
---

We walk through the main steps required when using AG Grid with Rollup.js. We use AG Grid modules to only include the code that we require with the aim of keeping bundle size to a minimum.

[[note]]
| A full working example of using Rollup.js with AG Grid can be found on
| [Github](https://github.com/seanlandsman/ag-grid-rollup).

## Initialise Project

```bash
mkdir ag-grid-rollup
cd ag-grid-rollup
npm init --yes
```

## Install Dependencies

```bash
npm i --save @ag-grid-community/client-side-row-model

// or, if using Enterprise features
npm i --save @ag-grid-enterprise/range-selection

npm i --save-dev rollup @rollup/plugin-node-resolve rollup-plugin-postcss
```

## Create Application

Our application will be a very simple one, consisting of a single file that will render a simple grid:

```js
// main-ag-grid.js
import { Grid, ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
// import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-balham.css';

ModuleRegistry.registerModules([ClientSideRowModelModule])

// If using enterprise feature register that module too.
// ModuleRegistry.registerModules([ClientSideRowModelModule, RangeSelectionModule])

// specify the columns
var columnDefs = [
    { field: "make" },
    { field: "model" },
    { field: "price" }
];

// specify the data
var rowData = [
    { make: "Toyota", model: "Celica", price: 35000 },
    { make: "Ford", model: "Mondeo", price: 32000 },
    { make: "Porsche", model: "Boxster", price: 72000 }
];

// let the grid know which columns and what data to use
var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData
};

// lookup the container we want the Grid to use
var eGridDiv = document.querySelector('#myGrid');

// create the grid passing in the div to use together with the columns & data we want to use
new Grid(eGridDiv, gridOptions);
```

```html
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<div id="myGrid" style="height: 200px;width:500px;" class="ag-theme-alpine"></div>

<script src="./dist/ag-bundle.js"></script>
</body>
</html>
```

## Rollup Configuration

Our `rollup.ag-grid.json` is very simple in this example:

```jsx
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss'

export default {
    input: './main-ag-grid.js',
    output: {
        file: './dist/ag-bundle.js',
        format: 'umd',
    },
    plugins: [
        nodeResolve(),
        postcss({
            extract: true,
            extensions: [".css"]
        })
    ],
    onwarn: (msg, warn) => {
        if (msg.code === 'THIS_IS_UNDEFINED') return;
        if (!/Circular/.test(msg)) {
            warn(msg)
        }
    }
};
```

## Building our bundle

We can now build our bundle:

```bash
rollup -c rollup.ag-grid.config.js
```

The resulting bundle will be available in `./dist/ag-bundle.js`

If we now serve `index-ag-grid.html` our grid will be rendered as expected:

<image-caption src="building-rollup/resources/bundled-grid.png" width="33rem" alt="Bundled Grid" centered="true" constrained="true"></image-caption>

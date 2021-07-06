---
title: "Building AG Grid with Rollup.js"
frameworks: ["javascript"]
---

We walk through the main steps required when using AG Grid with Rollup.js.

[[note]]
| A full working example of using Rollup.js with AG Grid can be found on
| [Github](https://github.com/seanlandsman/ag-grid-rollup).

[[note]]
| This walkthrough uses the `@ag-grid-community/all-modules` package which will include all
| features of AG Grid. If you're using Rollup to reduce your bundle size you probably want to be selective
| in which packages you include - please see the [Modules](/modules/) documentation for more
| information.

## Initialise Project

```bash
mkdir ag-grid-rollup
cd ag-grid-rollup
npm init --yes
```

## Install Dependencies

```bash
npm i --save @ag-grid-community/all-modules

// or, if using Enterprise features
npm i --save @ag-grid-enterprise/all-modules

npm i --save-dev rollup rollup-plugin-node-resolve
```

## Create Application

Our application will be a very simple one, consisting of a single file that will render a simple grid:

```js
// main-ag-grid.js
import {Grid} from '@ag-grid-community/all-modules'

// or, if using enterprise features
// import {Grid} from '@ag-grid-enterprise/all-modules'

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
    { make: "Porsche", model: "Boxter", price: 72000 }
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
    <link rel="stylesheet" href="./node_modules/@ag-grid-community/all-modules/dist/styles/ag-grid.css">
    <link rel="stylesheet" href="./node_modules/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css">

    <!-- or, if using Enterprise features -->
    <!-- <link rel="stylesheet" href="./node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-grid.css"> -->
    <!-- <link rel="stylesheet" href="./node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-theme-alpine.css"> -->
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
const node = require('rollup-plugin-node-resolve');

export default <span ng-non-bindable>&#123;</span>
    input: './main-ag-grid.js',
    output: <span ng-non-bindable>&#123;</span>
        file: './dist/ag-bundle.js',
        format: 'umd',
    },
    plugins: [
        node()
    ],
    onwarn: (msg, warn) => <span ng-non-bindable>&#123;</span>
        if (msg.code === 'THIS_IS_UNDEFINED') return;
        if (!/Circular/.test(msg)) <span ng-non-bindable>&#123;</span>
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

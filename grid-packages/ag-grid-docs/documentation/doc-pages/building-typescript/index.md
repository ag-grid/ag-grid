---
title: "TypeScript - Building with Webpack"
frameworks: ["javascript"]
---

We walk through the main steps required when using AG Grid, TypeScript and Webpack below, but for more information about either TypeScript or Webpack please refer to those sites for more in depth information around these tools.

## Initialise Project

```bash
mkdir ag-grid-ts-webpack
cd ag-grid-ts-webpack
npm init --yes
```

## Install Dependencies

```bash
npm i --save @ag-grid-community/client-side-row-model

# If using Enterprise features i.e row grouping add those too
# npm i --save @ag-grid-enterprise/row-grouping

npm i --save-dev typescript ts-loader webpack webpack-dev-server webpack-cli
npm i --save-dev sass-loader sass style-loader css-loader html-webpack-plugin
```

## Create Application

Our application will be a very simple one, consisting of a single class that will render a simple grid:

```js
import { Grid, GridOptions, ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";

// or, if using Enterprise features
// import {Grid, GridOptions, ModuleRegistry} from "@ag-grid-enterprise/core";
// import {RowGroupingModule} from '@ag-grid-enterprise/row-grouping';
// import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";

ModuleRegistry.register(ClientSideRowModelModule);

import './styles.scss';

class SimpleGrid {
    private gridOptions: GridOptions = <GridOptions>{};

    constructor() {
        this.gridOptions = {
            columnDefs: this.createColumnDefs(),
            rowData: this.createRowData()
        };

        let eGridDiv:HTMLElement = <HTMLElement>document.querySelector('#myGrid');
        new Grid(eGridDiv, this.gridOptions);
    }

    // specify the columns
    private createColumnDefs() {
        return [
            { field: "make" },
            { field: "model" },
            { field: "price" }
        ];
    }

    // specify the data
    private createRowData() {
        return [
            { make: "Toyota", model: "Celica", price: 35000 },
            { make: "Ford", model: "Mondeo", price: 32000 },
            { make: "Porsche", model: "Boxster", price: 72000 }
        ];
    }
}

new SimpleGrid();
```

```html
<!DOCTYPE html>
<html>
<head>
<title>AG Grid</title>
</head>

<body>
    <div id="myGrid" style="height: 200px;width: 600px" class="ag-theme-alpine"></div>
</body>
</html>
```


## Webpack Configuration

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/SimpleGrid.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ]
};
```

### entry

This serves as our entry point for our application.

### resolve

As our imports specify what file extension to use, we need to specify what file types we want to match on - in this case we're looking at TypeScript and JavaScript files, but you could also add CSS & HTML files too.

### module.rules

Loaders tell Webpack how & what to do with certain types of file - we have specified a few here to deal with Typescript, HTML, CSS and Images:

- ts-loader: transpile Typescript to ES5
- scss: process and bundle imported SCSS

### plugins

- `HtmlWebpackPlugin`: takes our supplied template `index.html` and inserts the generated JS file for us

## Typescript Configuration

We don't need to specify any Typescript configuration here, but `ts-loader` does expect a `tsconfig.json` so we need to create an empty file in the root of the project named `tsconfig.json`.

With all this in place, we can now add the following npm scripts to our package.json:

```js
"scripts": {
    "start": "webpack-dev-server --progress --port 8080 --mode development",
    "build": "webpack --mode production"
},
```

Now we can either run `npm start` to run the development setup, or `npm run build` for the production build. In the case of the production build the generated files will be under the `dist/` folder.

If we now run our application with the above code we will see this:

<image-caption src="building-typescript/resources/ts-grid.png" alt="Datagrid" width="40rem" centered="true" constrained="true"></image-caption>

## Example Code

The code for this example can be found on [GitHub](https://github.com/seanlandsman/ag-grid-typescript-webpack/).

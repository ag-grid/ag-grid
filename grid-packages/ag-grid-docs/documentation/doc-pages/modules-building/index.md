---
title: "Building Applications With AG Grid Modules"
---

In this section we demonstrate how you to cherry pick modules to provide the features you need with a reduced application bundle size.

[[only-frameworks]]
| ## Introduction
|
| In order to use selective AG Grid modules within your application you need to do two things:
|
| - Specify the modules you require as dependencies
| - Register the modules you require with the Grid
|
| That's it! In the sections below we will expand on these points with examples.

[[only-frameworks]]
| ### Choosing Our Modules
|
| You can refer to the complete list of modules [here](/modules/#modules) but for our purposes we're going to assume that the application we're building requires the following features:
|
| - Client Side Row Model
| - Excel Export
| - Context Menu
|
| Recall from earlier [documentation](/modules/#providing-modules-to-individual-grids) that at a minimum you need to provide a [Row Model](/row-models/) to the Grid and in our case we've opted for the Client Side Row Model. Additionally we're going to provide [Excel Export](/excel-export/) functionality, so we're going to need the corresponding Excel Module. Finally, we'd like our users to be able to export the data using the [Context Menu](/context-menu/), so we'll include that module too.
|
| This is what our `package.json` file will look like based on the requirements above:
|
| ```js
| "dependencies": {
|     "@ag-grid-community/client-side-row-model": "~@AG_GRID_VERSION@",
|     "@ag-grid-enterprise/excel-export": "~@AG_GRID_VERSION@",
|     "@ag-grid-enterprise/menu": "~@AG_GRID_VERSION@"
|
|     //...other dependencies...
| }
| ```
|
| ### Registering Our Modules
|
| Now that these modules are available to us we need to import them within our application, and then register them with the Grid:
|
| ```js
| import { ModuleRegistry } from '@ag-grid-community/core';
| import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
| import { MenuModule } from '@ag-grid-enterprise/menu';
| import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
|
| ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule]);
| ```
|
| [[note]]
| | You do not need to register framework modules (ie. `@ag-grid-community/angular`, `@ag-grid-community/react`, `@ag-grid-community/vue` etc).
|
| And that's all that's required. Below is an example using the above configuration for your framework.
| 
| ### Example
| <grid-example title='Using Modules' name='module-grid' type='multi' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel"], "showCode": true }'></grid-example>
|
[[only-javascript]]
| ## Building Your Own UMD Bundle
|
| `ag-grid-community` and `ag-grid-enterprise` provide UMD bundles with their distribution for ease of use, and these are great for getting started and making use of all features with very little | effort.
|
| If however you do not need all the features provided by either package (Community or Enterprise) then it's possible to create your own UMD bundle - the rest of this section describes how this can be done.
|
| As with the sections above we're going to assume that we only require the following modules in our bundle:
|
| - Client Side Row Model
| - Excel Export
| - Context Menu
|
| ### Specify Our Dependencies
|
| This is what our `package.json` file will look like based on the requirements above:
|
| ```js
| "dependencies": {
|     "@ag-grid-community/client-side-row-model": "~@AG_GRID_VERSION@",
|     "@ag-grid-enterprise/excel-export": "~@AG_GRID_VERSION@",
|     "@ag-grid-enterprise/menu": "~@AG_GRID_VERSION@"
|
|     //...other dependencies...
| }
| ```
|
| ### Specify What Include in the Bundle
|
| Next we need to include the modules in the bundle we're going to create. We also need to ensure we include the relevant `core` packages - in our case we need both `@ag-grid-community/core` and
| `@ag-grid-enterprise/core` as we're using both Community and Enterprise features. If you were only using the Community bundle you could omit the `@ag-grid-enterprise/core` entry here.
|
| Additionally we can include the theme(s) we want to include in our bundle - for our example we're going to specify the Alpine theme.
|
| Let's create a file called `main.js` that will serve as our entry point:
|
| ```js
| export * from '@ag-grid-community/core';
| export * from '@ag-grid-enterprise/core';
| export * from '@ag-grid-community/client-side-row-model';
| export * from '@ag-grid-enterprise/menu';
| export * from '@ag-grid-enterprise/excel-export';
|
| import { ModuleRegistry } from '@ag-grid-community/core';
| import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
| import { MenuModule } from '@ag-grid-enterprise/menu';
| import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
|
| ModuleRegistry.register(ClientSideRowModelModule);
| ModuleRegistry.register(MenuModule);
| ModuleRegistry.register(ExcelExportModule);
|
| import '@ag-grid-community/styles/ag-grid.css';
| import '@ag-grid-community/styles/ag-theme-alpine.css';
| ```
|
| Note that we've included the Module Registration step here - we do this so that consumers of our UMD bundle won't have to. This is a convenience step but is recommended for UMD bundles.
|
| Next we'll create a Webpack configuration file:
|
| ```js
| module.exports = {
|     mode: 'production',
|     entry: path.resolve(__dirname, '../src/main.js'),
|     output: {
|         path: path.resolve(__dirname, '../dist'),
|         filename: 'bundle.umd.js',
|         library: ['agGrid'],
|         libraryTarget: 'umd'
|     }
| }
| ```
|
| There are two main items here:
|
| - `entry`: We specify the `main.js` entry file we created that will determine what to include in our bundle.
| - `output`: We specify a library name of `agGrid` as the property to export when the bundle is included - this can however be any name you choose.
|
| You can then build your bundle as follows:
|
| ```bash
| webpack --config config/webpack.prod.js
| ```
|
| Which will result in a file called `dist/bundle.umd.js` being created, which we can then use as follows:
|
| ```html
| <!DOCTYPE html>
| <html>
| <head>
|     <script src="./dist/bundle.umd.js"></script>
|
|     <script>
|         var columnDefs = [
|             { field: 'make' },
|             { field: 'model' },
|             { field: 'price' }
|         ];
|
|         // specify the data
|         var rowData = [
|             { make: 'Toyota', model: 'Celica', price: 35000 },
|             { make: 'Ford', model: 'Mondeo', price: 32000 },
|             { make: 'Porsche', model: 'Boxster', price: 72000 }
|         ];
|
|         // let the grid know which columns and what data to use
|         var gridOptions = {
|             columnDefs: columnDefs,
|             rowData: rowData
|         };
|
|         // setup the grid after the page has finished loading
|         document.addEventListener('DOMContentLoaded', function () {
|             var gridDiv = document.querySelector('#myGrid');
|             new agGrid.Grid(gridDiv, gridOptions);
|         });
|     </script>
| </head>
| <body>
|     <div id="myGrid" style="height: 200px; width:500px;" class="ag-theme-alpine"></div>
| </body>
| </html>
| ```
|

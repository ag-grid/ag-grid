---
title: "Building Applications With AG Grid Modules"
---

In this section we demonstrate how you can cherry pick modules to provide the features you need with a reduced application bundle size.

<framework-specific-section frameworks="frameworks">
| ## Introduction
|
| In order to use selective AG Grid modules within your application you need to do two things:
|
| - Specify the modules you require as dependencies
| - Register the modules you require with the Grid
|
| That's it! In the sections below we will expand on these points with examples.
||
| ### Choosing Our Modules
|
| You can refer to the [Complete List of Modules here](/modules/#modules) but for our purposes we're going to assume that the application we're building requires the following features:
|
| - Client Side Row Model
| - Excel Export
| - Context Menu
|
| At a minimum you need to provide a [Row Model](/row-models/) to the Grid (as described in [Installing AG Grid Modules](/modules/#installing-ag-grid-modules)), and in our case we've opted for the Client Side Row Model. Additionally we're going to provide [Excel Export](/excel-export/) functionality, so we're going to need the corresponding Excel Module. Finally, we'd like our users to be able to export the data using the [Context Menu](/context-menu/), so we'll include that module too.
|
| This is what our `package.json` file will look like based on the requirements above:
|
</framework-specific-section>

<framework-specific-section frameworks="frameworks">
<snippet transform={false}>
| "dependencies": {
|     "@ag-grid-community/client-side-row-model": "~@AG_GRID_VERSION@",
|     "@ag-grid-enterprise/excel-export": "~@AG_GRID_VERSION@",
|     "@ag-grid-enterprise/menu": "~@AG_GRID_VERSION@"
|
|     //...other dependencies...
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="frameworks">
| ### Registering Our Modules
|
| Now that these modules are available to us we need to import them within our application, and then register them with the Grid:
</framework-specific-section>

<framework-specific-section frameworks="frameworks">
<snippet transform={false}>
| import { ModuleRegistry } from '@ag-grid-community/core';
| import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
| import { MenuModule } from '@ag-grid-enterprise/menu';
| import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
|
| ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule]);
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="frameworks">
<note>
| You do not need to register framework modules (ie. `@ag-grid-community/angular`, `@ag-grid-community/react`, `@ag-grid-community/vue` etc).
</note>
</framework-specific-section>

<framework-specific-section frameworks="frameworks">
| And that's all that's required. Below is an example using the above configuration for your framework.
| 
| ### Example
</framework-specific-section>

<framework-specific-section frameworks="frameworks">
<grid-example title='Using Modules' name='module-grid' type='multi' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel"], "showCode": true }'></grid-example>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| ## Building Your Own UMD Bundle
|
| `ag-grid-community` and `ag-grid-enterprise` provide UMD bundles with their distribution for ease of use, and these are great for getting started and making use of all features with very little effort.
|
| If however you do not need all the features provided by either package (Community or Enterprise), then it's possible to create your own UMD bundle - the rest of this section describes how this can be done.
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
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| "dependencies": {
|     "@ag-grid-community/client-side-row-model": "~@AG_GRID_VERSION@",
|     "@ag-grid-enterprise/excel-export": "~@AG_GRID_VERSION@",
|     "@ag-grid-enterprise/menu": "~@AG_GRID_VERSION@"
|
|     //...other dependencies...
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
|
| ### Specify What Is Included In The Bundle
|
| Next we need to include the modules in the bundle we're going to create. We also need to ensure we include the relevant `core` packages - in our case we need both `@ag-grid-community/core` and
| `@ag-grid-enterprise/core` as we're using both Community and Enterprise features. If you were only using the Community bundle you could omit the `@ag-grid-enterprise/core` entry here.
|
| Additionally we can include the theme(s) we want to include in our bundle - for our example we're going to specify the Quartz theme.
|
| Let's create a file called `main.js` that will serve as our entry point:
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
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
| import '@ag-grid-community/styles/ag-theme-quartz.css';
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| Note that we've included the Module Registration step here - we do this so that consumers of our UMD bundle won't have to. This is a convenience step but is recommended for UMD bundles.
|
| Next we'll create a Webpack configuration file:
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
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
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| There are two main items here:
|
| - `entry`: We specify the `main.js` entry file we created that will determine what to include in our bundle.
| - `output`: We specify a library name of `agGrid` as the property to export when the bundle is included - this can however be any name you choose.
|
| You can then build your bundle as follows:
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="bash">
| webpack --config config/webpack.prod.js
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="javascript">
| Which will result in a file called `dist/bundle.umd.js` being created, which we can then use as follows:
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="html">
| &lt;!DOCTYPE html>
| &lt;html>
| &lt;head>
|     &lt;script src="./dist/bundle.umd.js">&lt;/script>
|
|     &lt;script>
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
|             var api = agGrid.createGrid(gridDiv, gridOptions);
|         });
|     &lt;/script>
| &lt;/head>
| &lt;body>
|     &lt;div id="myGrid" style="height: 200px; width:500px;" class="ag-theme-quartz">&lt;/div>
| &lt;/body>
| &lt;/html>
</snippet>
</framework-specific-section>
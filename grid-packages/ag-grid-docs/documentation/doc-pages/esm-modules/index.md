---
title: "Using ES Modules"
---

ES Modules are modern and allow for better tree-shaking - this section documents how you can use ES modules directly in your browser.

If you're using a bundler such as Webpack you won't need to do much more than reference AG Grid [modules](/modules/) or [packages](/packages/) and
Webpack will pull in modules by default.

If however you want to use ES Modules directly in the browser then you can do so as follows:

## Individual ES Modules with AG Grid in the Browser

```html
<!doctype html>
<html>
<head>
    <link rel="stylesheet" href="./node_modules/@ag-grid-community/styles/ag-grid.css">
    <link rel="stylesheet" href="./node_modules/@ag-grid-community/styles/ag-theme-alpine.css">
    <script type="module">
        import {
            ClientSideRowModelModule
        } from './node_modules/@ag-grid-community/client-side-row-model/dist/client-side-row-model.esm.js';
        import {
            Grid,
            ModuleRegistry
        } from './node_modules/@ag-grid-community/core/dist/core.esm.js';

        ModuleRegistry.registerModules([
            ClientSideRowModelModule
        ]);

        const columnDefs = [
            { field: "make" },
            { field: "model" },
            { field: "price" }
        ];

        // specify the data
        const rowData = [
            { make: "Toyota", model: `Corolla`, price: 35000 },
            { make: "Ford", model: "Mondeo", price: 32000 },
            { make: "Porsche", model: "Boxter", price: 72000 }
        ];

        // let the grid know which columns and what data to use
        const gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData
        };

        // setup the grid after the page has finished loading
        document.addEventListener('DOMContentLoaded', () => {
            const gridDiv = document.querySelector('#myGrid');
            new Grid(gridDiv, gridOptions);
        });
    </script>
</head>

<body>
<div id="myGrid" style="height: 200px; width:500px;" class="ag-theme-alpine"></div>
</body>
</html>
```

Note that if you want to reference individual modules you'd be better of using a bundler such as Webpack, or if you want to load modules as above but
via a CDN you'll need to use a shim such as [es-module-shims](https://www.npmjs.com/package/es-module-shims?activeTab=readme).

Alternatively you can use ES Modules with AG Grid packages, as documented [here](/esm-packages/).

## `all-modules` Replacement

If you were previously referencing `@ag-grid-community/all-modules/dist/ag-grid-enterprise.esm.js` or `@ag-grid-enterprise/all-modules/dist/ag-grid-community.esm.js` 
you can reference the equivalents at `ag-grid-community/ag-grid-enterprise.esm.js` or `ag-grid-enterprise/dist/ag-grid-community.esm.js` respectively.

For example:

```html
<!doctype html>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/ag-grid-enterprise/dist/styles/ag-grid.css">
    <link rel="stylesheet" href="https://unpkg.com/ag-grid-enterprise/dist/styles/ag-theme-alpine.css">
    <script type="module">
        import {
            ClientSideRowModelModule,
            ClipboardModule,
            ColumnsToolPanelModule,
            ExcelExportModule,
            FiltersToolPanelModule,
            Grid,
            GridChartsModule,
            LicenseManager,
            MasterDetailModule,
            MenuModule,
            ModuleRegistry,
            MultiFilterModule,
            RangeSelectionModule,
            RichSelectModule,
            RowGroupingModule,
            SetFilterModule,
            SideBarModule,
            StatusBarModule,
            ViewportRowModelModule,
        } from 'https://unpkg.com/ag-grid-enterprise/dist/ag-grid-enterprise.esm.js';

        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            GridChartsModule,
            ClipboardModule,
            ColumnsToolPanelModule,
            ExcelExportModule,
            FiltersToolPanelModule,
            MasterDetailModule,
            MenuModule,
            RangeSelectionModule,
            RichSelectModule,
            RowGroupingModule,
            SetFilterModule,
            MultiFilterModule,
            SideBarModule,
            StatusBarModule,
            ViewportRowModelModule,
        ]);

        const columnDefs = [
            { field: "make" },
            { field: "model" },
            { field: "price" }
        ];

        // specify the data
        const rowData = [
            { make: "Toyota", model: `Corolla`, price: 35000 },
            { make: "Ford", model: "Mondeo", price: 32000 },
            { make: "Porsche", model: "Boxter", price: 72000 }
        ];

        // let the grid know which columns and what data to use
        const gridOptions = {
            pagination: true,
            columnDefs: columnDefs,
            rowData: rowData
        };

        // setup the grid after the page has finished loading
        document.addEventListener('DOMContentLoaded', () => {
            const gridDiv = document.querySelector('#myGrid');
            new Grid(gridDiv, gridOptions);
        });
    </script>
</head>

<body>
<div id="myGrid" style="height: 200px; width:500px;" class="ag-theme-alpine"></div>
</body>
</html>
```

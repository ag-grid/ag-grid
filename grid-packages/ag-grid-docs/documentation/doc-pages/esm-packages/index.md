---
title: "Using ES Modules"
---

ES Modules are modern and allow for better tree-shaking - this section documents how you can use ES modules directly in your browser.

If you're using a bundler such as Webpack you won't need to do much more than reference AG Grid [modules](/modules/) or [packages](/packages/) and
Webpack will pull in modules by default.

If however you want to use ES Modules directly in the browser then you can do so as follows:

## ES Modules with AG Grid in the Browser

```html
<!doctype html>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/ag-grid-enterprise/dist/styles/ag-grid.css">
    <link rel="stylesheet" href="https://unpkg.com/ag-grid-enterprise/dist/styles/ag-theme-alpine.css">
    <script type="module">
        import {
            Grid
        } from './node_modules/ag-grid-enterprise/dist/ag-grid-enterprise.auto.complete.esm.js';

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
            defaultColDef: {
                wrapText: true,
                autoHeight: true,
                resizable: true,
                sortable: true,
                filter: true
            },
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

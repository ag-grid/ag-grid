---
title: "AG Grid Modules - Overview"
---

AG Grid `modules` allow you to just import the features which you need, resulting in a smaller application size overall.

[[note]]
| The introduction of modules in version 22.0.0 is a significant first step towards reducing
| the size of AG Grid inside applications. As most of the new modules cover enterprise
| features, community users should not expect to see a size reduction right away. However,
| in the coming releases, we will strive to reduce the size of the community-core module
| by splitting it out into separate community modules.

## Introduction

### Modules

The below table summarizes the modules provided in the AG Grid Community and AG Grid Enterprise packages.

<matrix-table src='modules/modules.json' columns='{ "title": "", "module": "Community Module", "exported": "Exported" }' stringonly="true" showcondition="notIn(enterprise, framework)"></matrix-table>
<matrix-table src='modules/modules.json' columns='{ "title": "", "module": "Enterprise Module<enterprise-icon></enterprise-icon>", "exported": "Exported" }' stringonly="true" showcondition="in(enterprise)"></matrix-table>

Note that neither `@ag-grid-community/all-modules` nor `@ag-grid-enterprise/all-modules` contain
framework support - if you require framework support you need to explicitly specify it:

[[only-angular]]
|<matrix-table src='modules/modules.json' columns='{ "title": "", "module": "Framework Module", "exported": "Exported" }' stringonly="true" showcondition="in(angular)"></matrix-table>
[[only-react]]
|<matrix-table src='modules/modules.json' columns='{ "title": "", "module": "Framework Module", "exported": "Exported" }' stringonly="true" showcondition="in(react)"></matrix-table>
[[only-vue]]
|<matrix-table src='modules/modules.json' columns='{ "title": "", "module": "Framework Module", "exported": "Exported" }' stringonly="true" showcondition="in(vue)"></matrix-table>

### All Modules Bundles

`@ag-grid-community/all-modules` can be considered to be equivalent to `ag-grid-community`, but
    with the additional
    need to register modules within. If using this module you might be better off using `ag-grid-community`
    as the bundle size
    will be similar and will reduce the need to register modules.

`@ag-grid-enterprise/all-modules` can be considered to be equivalent to `ag-grid-enterprise`,
    but with the additional
    need to register modules within. If using this module you might be better off using `ag-grid-enterprise`
    as the bundle size will be similar and will reduce the need to register
    modules.

[[note]]
| If you decide to use `@ag-grid-enterprise/all-modules` then you do **not** need to
| specify `@ag-grid-community/all-modules` too. `@ag-grid-enterprise/all-modules`
| will contain all Community modules.

## Mixing **packages** and **modules**

The following artifacts are "`modules`" and are designed to work to together:

| Module Prefix               |
| --------------------------- |
| `@ag-grid-community/xxxxx`  |
| `@ag-grid-enterprise/xxxxx` |

You **cannot** mix `packages` and `modules` - in other words you cannot have a mix of the following types of dependencies:

```js 
"dependencies": {
    "ag-grid-community": "~@AG_GRID_VERSION@" <- a package dependency
    "@ag-grid-enterprise/all-modules": "~@AG_GRID_VERSION@"  <- a module dependency
    //...other dependencies...
}
```

## Installing AG Grid Modules

If you choose to select individual modules then at a minimum the a [Row Model](/row-models/) need to be specified. After that all other modules are optional depending on your requirements.

There are two ways to supply modules to the grid - either globally or by individual grid.

### Providing Modules Globally

You can import and provide all modules to the Grid globally if you so desire, but you need to ensure that this is done before **_any_** Grids are instantiated.

- Specify Modules Dependencies
- Import Modules
- Register Modules

A real-world example might be that we wish to use the `Client Side Row Model` (the default row model) together with the `CSV`, `Excel` and `Master/Detail` features. Additionally we're writing a React application so we need to specify the `@ag-grid-community/react` dependency:

```js
"dependencies": {
    "@ag-grid-community/client-side-row-model": "~@AG_GRID_VERSION@",
    "@ag-grid-community/csv-export": "~@AG_GRID_VERSION@",
    "@ag-grid-enterprise/excel-export": "~@AG_GRID_VERSION@",
    "@ag-grid-enterprise/master-detail": "~@AG_GRID_VERSION@",
    "@ag-grid-community/react": "~@AG_GRID_VERSION@",
    //...other dependencies...
}
```

We now need to register the Grid modules we wish to use - note that this does not include `@ag-grid-community/react` as the React support is not a Grid feature, but rather a support library:

```js
import { ModuleRegistry } from '@ag-grid-community/core';     // @ag-grid-community/core will always be implicitly available
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import { MasterDetailModule } from "@ag-grid-enterprise/master-detail";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CsvExportModule,
    ExcelExportModule,
    MasterDetailModule
]);

// you can optionally register individual modules
// ModuleRegistry.register(ClientSideRowModelModule);
// ModuleRegistry.register(CsvExportModule);
// etc
```

### Providing Modules To Individual Grids

The steps required are:

- Specify Modules Dependencies
- Import Modules
- Provide Modules To Each Grid

Using the same real-world example above let us assume that we wish to use the `Client Side Row Model` (the default row model) together with the `CSV`, `Excel` and `Master/Detail` features. Additionally we're writing a React application so we need to specify the `@ag-grid-community/react` dependency:

```js
"dependencies": {
    "@ag-grid-community/client-side-row-model": "~@AG_GRID_VERSION@",
    "@ag-grid-community/csv-export": "~@AG_GRID_VERSION@",
    "@ag-grid-enterprise/excel-export": "~@AG_GRID_VERSION@",
    "@ag-grid-enterprise/master-detail": "~@AG_GRID_VERSION@",
    "@ag-grid-community/react": "~@AG_GRID_VERSION@",
    //...other dependencies...
}
```

We now need to provide the Grid modules we wish to use - note that this does not include `@ag-grid-community/react` as the React support is not a Grid feature, but rather a support library.

In our example we're writing a React application so the example will use `AgGridReact`, but the principle would apply for other frameworks too:

```js
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import { MasterDetailModule } from "@ag-grid-enterprise/master-detail";

import { AgGridReact } from "@ag-grid-community/react";

export default class GridExample extends Component {
    // ...rest of class..

    render() {
        return (
            <div style=<span>{</span>{height: 400, width: 900}} className="ag-theme-alpine">
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.props.rowData}
                    modules={[ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MasterDetailModule]}

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        )
    }
};
```

[[only-javascript]]
| Example
|
| ```js
| new Grid(<dom element>, gridOptions, { modules: [ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MasterDetailModule]});
| ```

[[only-angular]]
| Example
|
| ```jsx
| public modules: Module[] = [ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MasterDetailModule];
|
| <ag-grid-angular>
|     [rowData]="rowData"
|     [columnDefs]="columnDefs"
|     [modules]="modules"
| </ag-grid-angular>
| ```

[[only-vue]]
| Example
|
| ```jsx
| data() {
|     return {
|         columnDefs: ...column defs...,
|         rowData: ....row data...,
|         modules: [ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MasterDetailModule]
|     }
| }
| <ag-grid-vue
|     :columnDefs="columnDefs"
|     :rowData="rowData"
|     :modules="modules">
| </ag-grid-vue>
| ```

## Core Modules

If you specify _any_ Community or Enterprise dependency then the corresponding `core` module will also be pulled in and be made available to you.

For example, if you specify (for example) `@ag-grid-community/client-side-row-model` - a Community Module - then the corresponding `@ag-grid-community/core` will be available.

By the same token, if you specify (for example) `@ag-grid-enterprise/excel-export` - an Enterprise Module - then the corresponding `@ag-grid-enterprise/core` will be available.

This is worth knowing as you'll generally require the `core` packages for a variety of reasons - Grid related definitions for the `@ag-grid-community/core` module and `LicenseManager` for the `@ag-grid-enterprise/core` module.

Let us assume we have the following modules specified:

```js
"dependencies": {
    "@ag-grid-community/client-side-row-model": "~@AG_GRID_VERSION@",
    "@ag-grid-community/csv-export": "~@AG_GRID_VERSION@",
    "@ag-grid-enterprise/excel-export": "~@AG_GRID_VERSION@",
    "@ag-grid-enterprise/master-detail": "~@AG_GRID_VERSION@",
    "@ag-grid-community/react": "~@AG_GRID_VERSION@",
    //...other dependencies...
}
```

We can then assume the `core` packages are available implicitly:

```js
import { ColumnApi, GridApi } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";
```

## CSS/SCSS Paths

CSS & SCSS will be available in the `@ag-grid-community/core` module,  which will always be available (if any Community or Enterprise module is specified):

```css
/* CSS Community */
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";
```

```scss
// SCSS Community
@import "@ag-grid-community/core/dist/styles/ag-grid.scss";
@import "@ag-grid-community/core/dist/styles/ag-theme-alpine/sass/ag-theme-alpine.scss";
```

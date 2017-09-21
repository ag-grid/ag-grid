ag-Grid Aurelia Component
==============

This project contains the Aurelia Component for use with ag-Grid.

Usage
==============

Please refer to www.ag-grid.com for full documentation on ag-Grid and Aurelia integration. Also take a look a the provided examples at https://github.com/ag-grid/ag-grid-aurelia-example.

Frameworks Supported
====================
Framework specific Getting Started guides:
[Angular 1](https://www.ag-grid.com/best-angularjs-data-grid/) | [Angular 2](https://www.ag-grid.com/best-angular-2-data-grid/) | [Aurelia](https://www.ag-grid.com/best-aurelia-data-grid/)
[Javascript](https://www.ag-grid.com/best-javascript-data-grid/) | [React](https://www.ag-grid.com/best-react-data-grid/) | [TypeScript](https://www.ag-grid.com/ag-grid-typescript-webpack-2/)
[VueJS](https://www.ag-grid.com/best-vuejs-data-grid/) | [Web Components](https://www.ag-grid.com/best-web-component-data-grid/)

In your main entry.
```
aurelia.use
    .standardConfiguration()
    .plugin('ag-grid-aurelia');
```

In your view model
```
import {GridOptions} from 'ag-grid';
export class MyGridPage {

    public gridOptions:GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = [{id: 1, name: 'Shane'}, {id: 2, name: 'Sean'}];
    }

    public onGridReady(){
        console.log('Grid is ready!!');
        console.log('1st col field = ' + this.gridOptions.columnDefs[0].field);
    }

    public onIdClicked(row){
        console.log('id clicked ' + row.id);
    }
}


```
In your view template.  Here we are adding columns using markup. ColumnDefs can be added from your view model if you wish.
```
<template>
    <div style="width: 100%; height: 350px;">
      <ag-grid-aurelia grid-options.bind="gridOptions" class="ag-material"
                       row-height.bind="48"
                       grid-ready.call="onGridReady()">
        <ag-grid-column header-name="My Group Column">
          <ag-grid-column header-name="Id" field="id">
              <ag-cell-template>
                <button md-button class="btn accent"  click.delegate="params.context.onIdClicked(params.data)">${params.value}</button>
              </ag-cell-template>
          </ag-grid-column>
          <ag-grid-column header-name="Name" field="name" >
          </ag-grid-column>
        </ag-grid-column>

      </ag-grid-aurelia>
    </div>

</template>
```

Building
==============

To build:
- npm install
- npm install gulp -g
- npm install aurelia-framework
- npm install ag-grid
- (or: npm install aurelia-framework@1.0.x && npm install ag-grid@13.0.2)

- npm run build

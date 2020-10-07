import { Component } from '@angular/core';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

@Component({
  selector: 'my-app',
  template: `<div style="height: 100%; box-sizing: border-box;">
    <ag-grid-angular
      #agGrid
      style="width: 100%; height: 100%;"
      id="myGrid"
      class="ag-theme-alpine"
      [modules]="modules"
      [columnDefs]="columnDefs"
      [rowData]="rowData"
      (gridReady)="onGridReady($event)"
    ></ag-grid-angular>
  </div>`,
})
export class AppComponent {
  private gridApi;
  private gridColumnApi;

  public modules: Module[] = AllCommunityModules;
  private columnDefs;
  private rowData;

  constructor() {
    this.columnDefs = [
      {
        headerName: 'Col 1',
        colId: 'firstCol',
        field: 'height',
      },
      {
        headerName: 'Col 2',
        colId: 'firstCol',
        field: 'height',
      },
      {
        headerName: 'Col 3',
        field: 'height',
      },
      {
        headerName: 'Col 4',
        field: 'height',
      },
      {
        headerName: 'Col 5',
        valueGetter: 'data.width',
      },
      {
        headerName: 'Col 6',
        valueGetter: 'data.width',
      },
    ];
    this.rowData = this.createRowData();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    var cols = params.columnApi.getAllColumns();
    cols.forEach(function (col) {
      var colDef = col.getUserProvidedColDef();
      console.log(
        colDef.headerName + ', Column ID = ' + col.getId(),
        JSON.stringify(colDef)
      );
    });
  }

  createRowData() {
    var data = [];
    for (var i = 0; i < 20; i++) {
      data.push({
        height: Math.floor(Math.random() * 100),
        width: Math.floor(Math.random() * 100),
        depth: Math.floor(Math.random() * 100),
      });
    }
    return data;
  }
}

import { Component } from '@angular/core';
import { ColDef, GridReadyEvent, ValueFormatterParams } from 'ag-grid-community';
import { HttpClient } from '@angular/common/http';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

// Row Data Interface
interface IRow {
  company: string;
  country: 'USA' | 'China' | 'Kazakhstan';
  date: string;
  mission: string;
  price: number;
  successful: boolean;
}

@Component({
  selector: 'my-app',
  template: 
  `
  <div class="content">
    <!-- The AG Grid component, with Dimensions, CSS Theme, Row Data, and Column Definition -->
    <ag-grid-angular
      style="width: 100%; height: 550px;"
      [class]="themeClass"
      [rowData]="rowData"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDefs" 
      (gridReady)="onGridReady($event)"
      [pagination]="true"
    >
    </ag-grid-angular>
  </div>
  `
})

export class AppComponent {
  themeClass = /** DARK MODE START **/document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/;
  // Row Data: The data to be displayed.
  rowData: IRow[] = [];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef[] = [
    { field: "mission", filter: true },
    { field: "country" },
    { field: "successful" },
    { field: "date" },
    { 
      field: "price",
      valueFormatter: (params: ValueFormatterParams) => { return '£' + params.value.toLocaleString(); } // Format with inline function  
    },
    { field: "company" }
  ];

  // Default Column Definitions: Apply configuration across all columns
  defaultColDefs: ColDef = {
    filter: true
  }

  // Load data into grid when ready
  constructor(private http: HttpClient) {}
  onGridReady(params: GridReadyEvent) {
    this.http
      .get<any[]>('https://downloads.jamesswinton.com/space-mission-data.json')
      .subscribe(data => this.rowData = data);
  }
}

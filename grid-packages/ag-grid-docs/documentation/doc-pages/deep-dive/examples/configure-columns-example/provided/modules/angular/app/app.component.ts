import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { HttpClient } from '@angular/common/http';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry, GridReadyEvent } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

@Component({
  selector: 'my-app',
  template: 
  `
  <main class="main">
    <div class="content">
        <!-- The AG Grid component, with Dimensions, CSS Theme, Row Data, and Column Definition -->
        <ag-grid-angular
          style="width: 100%; height: 550px;"
          [class]="themeClass"
          [rowData]="rowData"
          [columnDefs]="colDefs"
          (gridReady)="onGridReady($event)"
        >
        </ag-grid-angular>
    </div>
  </main>
  `
})

export class AppComponent {
  themeClass = /** DARK MODE START **/document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/;
  // Row Data: The data to be displayed.
  rowData = [
    {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
    {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
    {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef[] = [
    { field: "mission", resizable: true },
    { field: "country" },
    { field: "successful" },
    { field: "date" },
    { field: "price" },
    { field: "company" }
  ];

  // Load data into grid when ready
  constructor(private http: HttpClient) {}
  onGridReady(params: GridReadyEvent) {
    this.http
      .get<any[]>('https://downloads.jamesswinton.com/space-mission-data.json')
      .subscribe(data => this.rowData = data);
  }
}

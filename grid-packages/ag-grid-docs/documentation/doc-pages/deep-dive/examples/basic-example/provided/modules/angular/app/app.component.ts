import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
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
      style="width: 100%; height: 201px;"
      [class]="themeClass"
      [rowData]="rowData"
      [columnDefs]="colDefs"
    >
    </ag-grid-angular>
  </div>
  `
})

export class AppComponent {
  themeClass = /** DARK MODE START **/document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/;

  // Row Data: The data to be displayed.
  rowData: IRow[] = [
    {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
    {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
    {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef[] = [
    { field: "mission" },
    { field: "country" },
    { field: "successful" },
    { field: "date" },
    { field: "price" },
    { field: "company" }
  ];
}

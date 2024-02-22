import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { ModuleRegistry, CellValueChangedEvent, ColDef, GridReadyEvent, ICellRendererParams, SelectionChangedEvent, ValueFormatterParams, ValueGetterParams } from '@ag-grid-community/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridAngular, ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

// Row Data Interface
interface IRow {
  company: string;
  location: string;
  price: number;
  successful: boolean;
}

@Component({
  standalone: true,
  template: `<button (click)="buttonClicked()">Launch!</button>`,
})
export class CustomButtonComponent implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams): void {}
  refresh(params: ICellRendererParams) {
    return true;
  }
  buttonClicked() {
    alert("Mission Launched");
  }
}

// Custom Cell Renderer Component
@Component({
  selector: 'app-mission-result-renderer',
  standalone: true,
  imports: [NgIf],
  template:`
  <span *ngIf="value" >
    <img
      [alt]="value"
      [src]="'https://www.ag-grid.com/example-assets/icons/' + value + '.png'"
      [height]="30"
    />
  </span>
  `,
  styles: ["img { width: auto; height: auto; } span {display: flex; height: 100%; justify-content: center; align-items: center} "]
})
export class MissionResultRenderer implements ICellRendererAngularComp {
  // Init Cell Value
  public value!: string;
  agInit(params: ICellRendererParams): void {
    this.value = params.value ? 'tick-in-circle' : 'cross-in-circle';
  }

  // Return Cell Value
  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    return true;
  }
}

// Custom Cell Renderer Component
@Component({
  selector: 'app-company-logo-renderer',
  standalone: true,
  imports: [NgIf],
  template: `
  <span *ngIf="value" >
    <img
      [alt]="value"
      [src]="'https://www.ag-grid.com/example-assets/space-company-logos/' + value.toLowerCase() + '.png'"
      [height]="30"
    />
  </span>
  `,
  styles: ["img {display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.1);} span {display: flex; height: 100%; width: 100%; align-items: center} p { text-overflow: ellipsis; overflow: hidden; white-space: nowrap }"]
})
export class CompanyLogoRenderer implements ICellRendererAngularComp {
  // Init Cell Value
  public value!: string;
  agInit(params: ICellRendererParams): void {
    this.value = params.value;
  }

  // Return Cell Value
  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    return true;
  }
}

@Component({
  standalone: true,
  template: `
    <a [href]="'https://en.wikipedia.org/wiki/' + parsedValue" target="_blank">{{ value }}</a>
  `
})
export class CompanyRenderer implements ICellRendererAngularComp {
  // Init Cell Value
  public value!: string;
  public parsedValue!: string;
  agInit(params: ICellRendererParams): void {
    this.value = params.value;
    if (params.value = 'Astra') {
      this.parsedValue = 'Astra_(American_spaceflight_company)'
    } else this.parsedValue = params.value;
  }

  // Return Cell Value
  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    return true;
  }
}

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [AgGridAngular, HttpClientModule],
  template: `
  <div class="content">
    <!-- The AG Grid component, with various Grid Option properties -->
    <ag-grid-angular
      style="width: 100%; height: 550px;"
      [class]="themeClass"
      [rowData]="rowData"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDef" 
      [pagination]="true" 
      [rowSelection]="'multiple'" 
      (gridReady)="onGridReady($event)"
      (cellValueChanged)="onCellValueChanged($event)"
      (selectionChanged)="onSelectionChanged($event)"
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
    {
      field: "company",
      valueGetter: (params: ValueGetterParams) => {
        return params.data.company;
    },
      cellRenderer: CompanyRenderer,
    },
    {
      headerName: "Logo", 
      valueGetter: params => { return params.data.company },
      cellRenderer: CompanyLogoRenderer,
    },
    {
      field: "price",
      valueGetter: params => { return params.data.price },
      // cellRenderer: PriceRenderer
    },
    {
      field: "successful", 
      cellRenderer: MissionResultRenderer 
    },
    {
      field: "button",
      cellRenderer: CustomButtonComponent,
    }
  ];

  // Load data into grid when ready
  constructor(private http: HttpClient) {}
  onGridReady(params: GridReadyEvent) {
    this.http
      .get<any[]>('https://www.ag-grid.com/example-assets/small-space-mission-data.json')
      .subscribe(data => this.rowData = data);
  }
}

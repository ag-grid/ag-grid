import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import { AgGridAngular } from 'ag-grid-angular';
import type {
    CellValueChangedEvent,
    ColDef,
    GridReadyEvent,
    ICellRendererParams,
    ValueFormatterParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Row Data Interface
interface IRow {
    mission: string;
    company: string;
    location: string;
    date: string;
    time: string;
    rocket: string;
    price: number;
    successful: boolean;
}

// Custom Cell Renderer Component
@Component({
    selector: 'app-company-logo-renderer',
    standalone: true,
    template: `
        <span>
            @if (value) {
                <img
                    [alt]="value"
                    [src]="'https://www.ag-grid.com/example-assets/space-company-logos/' + value.toLowerCase() + '.png'"
                />
                <p>{{ value }}</p>
            }
        </span>
    `,
    styles: [
        'img {display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.2);} span {display: flex; height: 100%; width: 100%; align-items: center} p { text-overflow: ellipsis; overflow: hidden; white-space: nowrap }',
    ],
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
    imports: [AgGridAngular, HttpClientModule],
    selector: 'my-app',
    template: `
        <div class="content">
            <!-- The AG Grid component, with Dimensions, CSS Theme, Row Data, and Column Definition -->
            <ag-grid-angular
                style="width: 100%; height: 550px;"
                [class]="themeClass"
                [rowData]="rowData"
                [columnDefs]="colDefs"
                [defaultColDef]="defaultColDef"
                [pagination]="true"
                (gridReady)="onGridReady($event)"
                (cellValueChanged)="onCellValueChanged($event)"
            />
        </div>
    `,
})
export class AppComponent {
    themeClass =
        /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
        'ag-theme-quartz' /** DARK MODE END **/;
    // Row Data: The data to be displayed.
    rowData: IRow[] = [];

    // Column Definitions: Defines & controls grid columns.
    colDefs: ColDef[] = [
        {
            field: 'mission',
            filter: true,
        },
        {
            field: 'company',
            cellRenderer: CompanyLogoRenderer,
        },
        {
            field: 'location',
        },
        { field: 'date' },
        {
            field: 'price',
            valueFormatter: (params: ValueFormatterParams) => {
                return '£' + params.value.toLocaleString();
            },
        },
        { field: 'successful' },
        { field: 'rocket' },
    ];

    // Default Column Definitions: Apply configuration across all columns
    defaultColDef: ColDef = {
        filter: true,
        editable: true,
    };

    // Handle cell editing event
    onCellValueChanged = (event: CellValueChangedEvent) => {
        console.log(`New Cell Value: ${event.value}`);
    };

    // Load data into grid when ready
    constructor(private http: HttpClient) {}
    onGridReady(params: GridReadyEvent) {
        this.http
            .get<any[]>('https://www.ag-grid.com/example-assets/space-mission-data.json')
            .subscribe((data) => (this.rowData = data));
    }
}

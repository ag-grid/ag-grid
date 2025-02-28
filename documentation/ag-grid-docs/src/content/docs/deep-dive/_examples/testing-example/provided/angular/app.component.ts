import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import { AgGridAngular } from 'ag-grid-angular';
import type {
    CellValueChangedEvent,
    ColDef,
    GridReadyEvent,
    ICellRendererParams,
    RowSelectionOptions,
    SelectionChangedEvent,
    ValueFormatterParams,
} from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

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
    selector: 'app-mission-result-renderer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    template: `
        <span>
            @if (value()) {
                <img
                    [alt]="value()"
                    [src]="'https://www.ag-grid.com/example-assets/icons/' + value() + '.png'"
                    [height]="30"
                />
            }
        </span>
    `,
    styles: [
        'img { width: auto; height: auto; } span {display: flex; height: 100%; justify-content: center; align-items: center} ',
    ],
})
export class MissionResultRenderer implements ICellRendererAngularComp {
    value = signal('');
    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.value.set(params.value ? 'tick-in-circle' : 'cross-in-circle');
        return true;
    }
}

// Custom Cell Renderer Component
@Component({
    selector: 'app-company-logo-renderer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    template: `
        <span>
            @if (value()) {
                <img
                    [alt]="value()"
                    [src]="'https://www.ag-grid.com/example-assets/space-company-logos/' + lowercase() + '.png'"
                />
                <p>{{ value() }}</p>
            }
        </span>
    `,
    styles: [
        'img {display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.2);} span {display: flex; height: 100%; width: 100%; align-items: center} p { text-overflow: ellipsis; overflow: hidden; white-space: nowrap }',
    ],
})
export class CompanyLogoRenderer implements ICellRendererAngularComp {
    value = signal('');
    lowercase = computed(() => this.value().toLowerCase());

    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.value.set(params.value);
        return true;
    }
}

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `
        <div class="content">
            <!-- The AG Grid component, with various Grid Option properties -->
            <ag-grid-angular
                style="width: 100%; height: 550px;"
                [rowData]="rowData"
                [columnDefs]="colDefs"
                [defaultColDef]="defaultColDef"
                [pagination]="true"
                [rowSelection]="rowSelection"
                (gridReady)="onGridReady($event)"
                (cellValueChanged)="onCellValueChanged($event)"
                (selectionChanged)="onSelectionChanged($event)"
            />
        </div>
    `,
})
export class AppComponent {
    // Return formatted date value
    dateFormatter(params: ValueFormatterParams) {
        return new Date(params.value).toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    // Row Data: The data to be displayed.
    rowData: IRow[] = [];

    // Column Definitions: Defines & controls grid columns.
    colDefs: ColDef[] = [
        {
            field: 'mission',
            width: 150,
        },
        {
            field: 'company',
            width: 130,
            cellRenderer: CompanyLogoRenderer,
        },
        {
            field: 'location',
            width: 225,
        },
        {
            field: 'date',
            valueFormatter: this.dateFormatter,
        },
        {
            field: 'price',
            width: 130,
            valueFormatter: (params) => {
                return '£' + params.value.toLocaleString();
            },
        },
        {
            field: 'successful',
            width: 120,
            cellRenderer: MissionResultRenderer,
        },
        { field: 'rocket' },
    ];

    rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: false,
    };

    // Default Column Definitions: Apply configuration across all columns
    defaultColDef: ColDef = {
        filter: true, // Enable filtering on all columns
        editable: true, // Enable editing on all columns
    };

    // Load data into grid when ready
    constructor(private http: HttpClient) {}
    onGridReady(params: GridReadyEvent) {
        this.http
            .get<any[]>('https://www.ag-grid.com/example-assets/space-mission-data.json')
            .subscribe((data) => (this.rowData = data));
    }

    // Handle row selection changed event
    onSelectionChanged = (event: SelectionChangedEvent) => {
        console.log('Row Selected!');
    };

    // Handle cell editing event
    onCellValueChanged = (event: CellValueChangedEvent) => {
        console.log(`New Cell Value: ${event.value}`);
    };
}

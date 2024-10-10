import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, ICellRenderer, ICellRendererParams, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
    standalone: true,
    template: `
        <span>
            <img [src]="src" />
            {{ displayValue }}
        </span>
    `,
})
export class DeltaRenderer implements ICellRenderer {
    src!: string;
    displayValue!: number;

    agInit(params: ImageCellRendererParams): void {
        this.displayValue = params.value;
        if (params.value > 15) {
            this.src = 'https://www.ag-grid.com/example-assets/weather/fire-plus.png';
        } else {
            this.src = 'https://www.ag-grid.com/example-assets/weather/fire-minus.png';
        }
    }

    refresh(): boolean {
        return true;
    }
}

export interface ImageCellRendererParams extends ICellRendererParams {
    rendererImage: string;
    divisor: number;
}
@Component({
    standalone: true,
    template: `
        <span>
            @for (number of arr; track $index) {
                <img [src]="src" />
            }
        </span>
    `,
})
export class IconRenderer implements ICellRenderer {
    arr!: number[];
    src!: string;

    agInit(params: ImageCellRendererParams): void {
        this.src = `https://www.ag-grid.com/example-assets/weather/${params.rendererImage}`;
        this.arr = new Array(Math.floor(params.value! / (params.divisor ?? 1)));
    }

    refresh(params: ImageCellRendererParams): boolean {
        this.src = `https://www.ag-grid.com/example-assets/weather/${params.rendererImage}`;
        this.arr = new Array(Math.floor(params.value! / (params.divisor ?? 1)));
        return true;
    }
}

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [HttpClientModule, AgGridAngular],
    template: `
        <div class="example-wrapper">
            <div style="margin-bottom: 5px;">
                <button (click)="randomiseFrost()">Randomise Frost</button>
            </div>
            <ag-grid-angular
                #agGrid
                style="width: 100%; height: 100%;"
                [class]="themeClass"
                [columnDefs]="columnDefs"
                [defaultColDef]="defaultColDef"
                (gridReady)="onGridReady($event)"
            />
        </div>
    `,
})
export class AppComponent {
    themeClass =
        /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
        'ag-theme-quartz' /** DARK MODE END **/;

    private gridApi!: GridApi;

    public columnDefs: ColDef[] = this.getColumnDefs();

    public defaultColDef: ColDef = {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    };

    constructor(private http: HttpClient) {}

    randomiseFrost() {
        // iterate over the "days of air frost" and randomise each.
        this.gridApi.forEachNode((rowNode: IRowNode) => {
            rowNode.setDataValue('Days of air frost (days)', Math.floor(pRandom() * 4) + 1);
        });
    }

    onGridReady(params: any) {
        this.gridApi = params.api;

        this.http
            .get('https://www.ag-grid.com/example-assets/weather-se-england.json')
            .subscribe((data) => params.api.setGridOption('rowData', data));
    }

    private getColumnDefs() {
        return [
            {
                headerName: 'Month',
                field: 'Month',
                width: 75,
            },
            {
                headerName: 'Max Temp',
                field: 'Max temp (C)',
                width: 120,
                cellRenderer: DeltaRenderer,
            },
            {
                headerName: 'Min Temp',
                field: 'Min temp (C)',
                width: 120,
                cellRenderer: DeltaRenderer,
            },
            {
                headerName: 'Frost',
                field: 'Days of air frost (days)',
                width: 233,
                cellRenderer: IconRenderer,
                cellRendererParams: { rendererImage: 'frost.png' },
            },
            {
                headerName: 'Sunshine',
                field: 'Sunshine (hours)',
                width: 190,
                cellRenderer: IconRenderer,
                cellRendererParams: { rendererImage: 'sun.png', divisor: 24 },
            },
            {
                headerName: 'Rainfall',
                field: 'Rainfall (mm)',
                width: 180,
                cellRenderer: IconRenderer,
                cellRendererParams: { rendererImage: 'rain.png', divisor: 10 },
            },
        ];
    }
}

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

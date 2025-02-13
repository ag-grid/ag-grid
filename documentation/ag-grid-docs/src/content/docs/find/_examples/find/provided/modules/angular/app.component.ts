import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    GetFindTextParams,
    GridApi,
    GridReadyEvent,
    ModuleRegistry,
    PinnedRowModule,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { FindRenderer } from './findRenderer.component';
import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    ValidationModule /* Development Only */,
]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular, FindRenderer],
    template: `<div class="example-wrapper">
        <div class="example-header">
            <span>Find:</span>
            <input type="text" id="find-text-box" />
            <button (click)="find()">Find</button>
            <button (click)="previous()">Previous</button>
            <button (click)="next()">Next</button>
            <span id="resultNum"></span>
            <div id="resultPosition"></div>
        </div>
        <ag-grid-angular
            style="width: 100%; height: 100%;"
            [pinnedTopRowData]="pinnedTopRowData"
            [pinnedBottomRowData]="pinnedBottomRowData"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowGroupPanelShow]="rowGroupPanelShow"
            [rowData]="rowData"
            (findChanged)="onFindChanged($event)"
            (gridReady)="onGridReady($event)"
        />
    </div> `,
})
export class AppComponent {
    private gridApi!: GridApi;

    pinnedTopRowData: any[] = [{ athlete: 'Michael Phelps' }];
    pinnedBottomRowData: any[] = [{ athlete: 'Michael Phelps' }];
    columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport' },
        {
            field: 'year',
            cellRenderer: FindRenderer,
            getFindText: (params: GetFindTextParams) => {
                const cellValue = params.getValueFormatted() ?? params.value?.toString();
                if (!cellValue?.length) {
                    return null;
                }
                return `Year is ${cellValue}`;
            },
        },
        { field: 'age', minWidth: 100 },
        { field: 'gold', minWidth: 100 },
        { field: 'silver', minWidth: 100 },
        { field: 'bronze', minWidth: 100 },
    ];
    defaultColDef: ColDef = {
        enableRowGroup: true,
    };
    rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never' = 'always';
    rowData!: any[];

    constructor(private http: HttpClient) {}

    onFindChanged(event: FindChangedEvent) {
        const { activeMatch, totalMatches } = event;
        (document.getElementById('resultNum') as HTMLElement).textContent = activeMatch
            ? `${activeMatch.numOverall}/${totalMatches}`
            : '';
        (document.getElementById('resultPosition') as HTMLElement).textContent = activeMatch
            ? ` { pinned: ${activeMatch.node.rowPinned}, row index: ${activeMatch.node.rowIndex}, column: ${activeMatch.column.getColId()}, num in cell: ${activeMatch.numInMatch} }`
            : '';
        console.log('findChanged', event);
    }

    find() {
        const findText = (document.getElementById('find-text-box') as HTMLInputElement).value;
        if (findText !== this.gridApi.getGridOption('findText')) {
            this.gridApi.setGridOption('findText', findText);
        }
    }

    next() {
        this.gridApi.findNext();
    }

    previous() {
        this.gridApi.findPrevious();
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;

        (document.getElementById('find-text-box') as HTMLInputElement).addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.find();
                const backwards = event.shiftKey;
                if (backwards) {
                    this.previous();
                } else {
                    this.next();
                }
            }
        });

        this.http
            .get<any[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => (this.rowData = data));
    }
}

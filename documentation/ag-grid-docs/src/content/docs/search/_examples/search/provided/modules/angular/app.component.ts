import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    ColGroupDef,
    GetSearchTextParams,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ModuleRegistry,
    PinnedRowModule,
    SearchChangedEvent,
    SearchModule,
    ValidationModule,
} from 'ag-grid-community';
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { SearchRenderer } from './searchRenderer.component';
import './styles.css';

ModuleRegistry.registerModules([
    SearchModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    ValidationModule /* Development Only */,
]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular, SearchRenderer],
    template: `<div class="example-wrapper">
        <div class="example-header">
            <span>Search:</span>
            <input type="text" id="search-text-box" />
            <button (click)="search()">Search</button>
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
            (searchChanged)="onSearchChanged($event)"
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
            cellRenderer: SearchRenderer,
            getSearchText: (params: GetSearchTextParams) => {
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

    onSearchChanged(event: SearchChangedEvent) {
        const { activeMatch, totalMatches } = event;
        (document.getElementById('resultNum') as HTMLElement).textContent = activeMatch
            ? `${activeMatch.numOverall}/${totalMatches}`
            : '';
        (document.getElementById('resultPosition') as HTMLElement).textContent = activeMatch
            ? ` { pinned: ${activeMatch.node.rowPinned}, row index: ${activeMatch.node.rowIndex}, column: ${activeMatch.column.getColId()}, num in cell: ${activeMatch.numInMatch} }`
            : '';
        console.log('searchChanged', event);
    }

    search() {
        const searchText = (document.getElementById('search-text-box') as HTMLInputElement).value;
        if (searchText !== this.gridApi.getGridOption('searchText')) {
            this.gridApi.setGridOption('searchText', searchText);
        }
    }

    next() {
        this.gridApi.searchNext();
    }

    previous() {
        this.gridApi.searchPrevious();
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;

        (document.getElementById('search-text-box') as HTMLInputElement).addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.search();
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

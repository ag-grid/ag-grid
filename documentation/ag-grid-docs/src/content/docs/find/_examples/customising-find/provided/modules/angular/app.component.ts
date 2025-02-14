import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    FindOptions,
    GridApi,
    GridReadyEvent,
    ModuleRegistry,
    PaginationModule,
    PinnedRowModule,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    PaginationModule,
    ValidationModule /* Development Only */,
]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `<div class="example-wrapper">
        <div class="example-header">
            <label>
                <span>caseSensitive:</span>
                <input id="caseSensitive" type="checkbox" (change)="toggleCaseSensitive()" checked="" />
            </label>
            <label>
                <span>currentPageOnly:</span>
                <input id="currentPageOnly" type="checkbox" (change)="toggleCurrentPageOnly()" checked="" />
            </label>
            <div>
                <span>Find:</span>
                <input type="text" id="find-text-box" />
                <button (click)="find()">Find</button>
                <button (click)="previous()">Previous</button>
                <button (click)="next()">Next</button>
                <span id="resultNum"></span>
            </div>
            <div>
                <span>Go to match:</span>
                <input type="number" id="find-goto" />
                <button (click)="goToFind()">Go To</button>
            </div>
        </div>
        <ag-grid-angular
            style="width: 100%; height: 100%;"
            [pinnedTopRowData]="pinnedTopRowData"
            [pinnedBottomRowData]="pinnedBottomRowData"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowGroupPanelShow]="rowGroupPanelShow"
            [pagination]="true"
            [paginationPageSize]="paginationPageSize"
            [paginationPageSizeSelector]="paginationPageSizeSelector"
            [findOptions]="findOptions"
            [rowData]="rowData"
            (findChanged)="onFindChanged($event)"
            (gridReady)="onGridReady($event)"
        />
    </div> `,
})
export class AppComponent {
    private gridApi!: GridApi;

    pinnedTopRowData: any[] = [{ athlete: 'Top' }];
    pinnedBottomRowData: any[] = [{ athlete: 'Bottom' }];
    columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport', rowGroup: true, hide: true },
        { field: 'year' },
        { field: 'age', minWidth: 100 },
        { field: 'gold', minWidth: 100 },
        { field: 'silver', minWidth: 100 },
        { field: 'bronze', minWidth: 100 },
    ];
    defaultColDef: ColDef = {
        enableRowGroup: true,
    };
    rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never' = 'always';
    paginationPageSize = 5;
    paginationPageSizeSelector: number[] | boolean = [5, 10];
    findOptions: FindOptions = {
        caseSensitive: true,
        currentPageOnly: true,
    };
    rowData!: any[];

    constructor(private http: HttpClient) {}

    onFindChanged(event: FindChangedEvent) {
        const { activeMatch, totalMatches, findSearchValue } = event;
        (document.getElementById('resultNum') as HTMLElement).textContent = findSearchValue?.length
            ? `${activeMatch?.numOverall ?? 0}/${totalMatches}`
            : '';
    }

    find() {
        const findSearchValue = (document.getElementById('find-text-box') as HTMLInputElement).value;
        if (findSearchValue !== this.gridApi.getGridOption('findSearchValue')) {
            this.gridApi.setGridOption('findSearchValue', findSearchValue);
        }
    }

    next() {
        this.gridApi.findNext();
    }

    previous() {
        this.gridApi.findPrevious();
    }

    goToFind() {
        const num = Number((document.getElementById('find-goto') as HTMLInputElement).value);
        if (isNaN(num) || num < 0) {
            return;
        }
        this.gridApi.findGoTo(num);
    }

    toggleCaseSensitive() {
        const caseSensitive = (document.getElementById('caseSensitive') as HTMLInputElement).checked;
        const findOptions = this.gridApi.getGridOption('findOptions');
        this.gridApi.setGridOption('findOptions', {
            ...findOptions,
            caseSensitive,
        });
    }

    toggleCurrentPageOnly() {
        const currentPageOnly = (document.getElementById('currentPageOnly') as HTMLInputElement).checked;
        const findOptions = this.gridApi.getGridOption('findOptions');
        this.gridApi.setGridOption('findOptions', {
            ...findOptions,
            currentPageOnly,
        });
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

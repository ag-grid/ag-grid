import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';

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
            <div class="example-controls">
                <label>
                    <span>caseSensitive:</span>
                    <input id="caseSensitive" type="checkbox" (change)="toggleCaseSensitive($event)" checked="" />
                </label>
                <label>
                    <span>currentPageOnly:</span>
                    <input id="currentPageOnly" type="checkbox" (change)="toggleCurrentPageOnly($event)" checked="" />
                </label>
            </div>
            <div class="example-controls">
                <span>Find:</span>
                <input type="text" (input)="onInput($event)" (keydown)="onKeyDown($event)" />
                <button (click)="previous()">Previous</button>
                <button (click)="next()">Next</button>
                <span>{{ activeMatchNum }}</span>
            </div>
            <div class="example-controls">
                <span>Go to match:</span>
                <input #goToInput type="number" />
                <button (click)="goToFind()">Go To</button>
            </div>
            <div>{{ activeMatch }}</div>
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
            [findSearchValue]="findSearchValue"
            (findChanged)="onFindChanged($event)"
            (gridReady)="onGridReady($event)"
        />
    </div> `,
})
export class AppComponent {
    @ViewChild('goToInput', { read: ElementRef }) public goToInput!: ElementRef;

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
    rowData!: any[];

    activeMatchNum: string = '';

    activeMatch: string = '';

    findSearchValue: string | undefined;
    findOptions: FindOptions = {
        caseSensitive: true,
        currentPageOnly: true,
    };

    constructor(private http: HttpClient) {}

    onFindChanged(event: FindChangedEvent) {
        const { activeMatch, totalMatches, findSearchValue } = event;
        this.activeMatchNum = findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '';
        this.activeMatch = activeMatch
            ? `Active match: { pinned: ${activeMatch.node.rowPinned}, row index: ${activeMatch.node.rowIndex}, column: ${activeMatch.column.getColId()}, match number in cell: ${activeMatch.numInMatch} }`
            : '';
    }

    next() {
        this.gridApi.findNext();
    }

    previous() {
        this.gridApi.findPrevious();
    }

    goToFind() {
        const num = Number((this.goToInput.nativeElement as HTMLInputElement).value);
        if (isNaN(num) || num < 0) {
            return;
        }
        this.gridApi.findGoTo(num);
    }

    toggleCaseSensitive(event: Event) {
        const caseSensitive = (event.target as HTMLInputElement).checked;
        this.findOptions = {
            ...this.findOptions,
            caseSensitive,
        };
    }

    toggleCurrentPageOnly(event: Event) {
        const currentPageOnly = (event.target as HTMLInputElement).checked;
        this.findOptions = {
            ...this.findOptions,
            currentPageOnly,
        };
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;

        this.http
            .get<any[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => (this.rowData = data));
    }

    onInput(event: Event): void {
        this.findSearchValue = (event.target as HTMLInputElement).value;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            const backwards = event.shiftKey;
            if (backwards) {
                this.previous();
            } else {
                this.next();
            }
        }
    }
}

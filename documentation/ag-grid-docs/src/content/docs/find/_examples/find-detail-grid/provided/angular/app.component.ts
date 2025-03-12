import { Component, ElementRef, ViewChild } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    FindOptions,
    FirstDataRenderedEvent,
    GetDetailRowDataParams,
    GetFindMatchesParams,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    IDetailCellRendererParams,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule } from 'ag-grid-enterprise';

import { getData } from './data';
import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    RowApiModule,
    ValidationModule /* Development Only */,
]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `<div class="example-wrapper">
        <div class="example-header">
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
        </div>
        <ag-grid-angular
            style="width: 100%; height: 100%;"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
            [masterDetail]="true"
            [getRowId]="getRowId"
            [detailCellRendererParams]="detailCellRendererParams"
            [findOptions]="findOptions"
            [findSearchValue]="findSearchValue"
            (findChanged)="onFindChanged($event)"
            (firstDataRendered)="onFirstDataRendered($event)"
            (gridReady)="onGridReady($event)"
        />
    </div> `,
})
export class AppComponent {
    @ViewChild('goToInput', { read: ElementRef }) public goToInput!: ElementRef;

    private gridApi!: GridApi;

    columnDefs: ColDef[] = [{ field: 'a1', cellRenderer: 'agGroupCellRenderer' }, { field: 'b1' }];
    defaultColDef: ColDef = {
        flex: 1,
    };
    rowData = getData();
    getRowId = (params: GetRowIdParams) => params.data.a1;
    findOptions: FindOptions = {
        searchDetail: true,
    };
    detailCellRendererParams: Partial<IDetailCellRendererParams> = {
        // level 2 grid options
        detailGridOptions: {
            columnDefs: [{ field: 'a2', cellRenderer: 'agGroupCellRenderer' }, { field: 'b2' }],
            defaultColDef: {
                flex: 1,
            },
            masterDetail: true,
            detailRowHeight: 240,
            getRowId: (params: GetRowIdParams) => params.data.a2,
            findOptions: {
                searchDetail: true,
            },
            detailCellRendererParams: {
                // level 3 grid options
                detailGridOptions: {
                    columnDefs: [{ field: 'a3', cellRenderer: 'agGroupCellRenderer' }, { field: 'b3' }],
                    defaultColDef: {
                        flex: 1,
                    },
                    getRowId: (params: GetRowIdParams) => params.data.a3,
                },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    params.successCallback(params.data.children);
                },
                getFindMatches: (params: GetFindMatchesParams) => this.getFindMatches(params),
            } as IDetailCellRendererParams,
        },
        getDetailRowData: (params: GetDetailRowDataParams) => {
            params.successCallback(params.data.children);
        },
        getFindMatches: (params: GetFindMatchesParams) => this.getFindMatches(params),
    };

    activeMatchNum: string = '';

    findSearchValue: string | undefined;

    constructor() {}

    onFindChanged(event: FindChangedEvent) {
        const { activeMatch, totalMatches, findSearchValue } = event;
        this.activeMatchNum = findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '';
    }

    onFirstDataRendered(event: FirstDataRenderedEvent) {
        event.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
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

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
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

    private getFindMatches(params: GetFindMatchesParams) {
        const getMatchesForValue = params.getMatchesForValue;
        let numMatches = 0;
        const checkRow = (row: any) => {
            for (const key of Object.keys(row)) {
                if (key === 'children') {
                    row.children.forEach((child: any) => checkRow(child));
                } else {
                    numMatches += getMatchesForValue(row[key]);
                }
            }
        };
        params.data.children.forEach(checkRow);
        return numMatches;
    }
}

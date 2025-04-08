import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    FindDetailCellRendererParams,
    FindOptions,
    FirstDataRenderedEvent,
    GetFindMatchesParams,
    GridApi,
    GridReadyEvent,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule } from 'ag-grid-enterprise';

import { DetailCellRenderer } from './detail-cell-renderer.component';
import './styles.css';

ModuleRegistry.registerModules([
    FindModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    RowApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
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
            [rowData]="rowData"
            [findSearchValue]="findSearchValue"
            [masterDetail]="true"
            [detailCellRenderer]="detailCellRenderer"
            [detailCellRendererParams]="detailCellRendererParams"
            [detailRowHeight]="100"
            [findOptions]="findOptions"
            (findChanged)="onFindChanged($event)"
            (firstDataRendered)="onFirstDataRendered($event)"
            (gridReady)="onGridReady($event)"
        />
    </div> `,
})
export class AppComponent {
    @ViewChild('goToInput', { read: ElementRef }) public goToInput!: ElementRef;

    private gridApi!: GridApi;

    columnDefs: ColDef[] = [
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
    ];
    rowData!: any[];

    detailCellRenderer = DetailCellRenderer;

    detailCellRendererParams: FindDetailCellRendererParams = {
        getFindMatches: (params: GetFindMatchesParams) => {
            return params.getMatchesForValue('My Custom Detail');
        },
    };

    activeMatchNum: string = '';

    findSearchValue: string | undefined;

    findOptions: FindOptions = {
        searchDetail: true,
    };

    constructor(private http: HttpClient) {}

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

        this.http
            .get<any[]>('https://www.ag-grid.com/example-assets/master-detail-data.json')
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

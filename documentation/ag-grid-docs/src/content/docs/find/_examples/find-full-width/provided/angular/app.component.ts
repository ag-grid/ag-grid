import { Component, ElementRef, ViewChild } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    FindFullWidthCellRendererParams,
    GetFindMatchesParams,
    GridApi,
    GridReadyEvent,
    IsFullWidthRowParams,
    ModuleRegistry,
    RowHeightParams,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';

import { getData, getLatinText } from './data';
import { FullWidthCellRenderer } from './full-width-cell-renderer.component';
import './styles.css';

ModuleRegistry.registerModules([FindModule, ClientSideRowModelModule, ValidationModule /* Development Only */]);

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
            [getRowHeight]="getRowHeight"
            [isFullWidthRow]="isFullWidthRow"
            [fullWidthCellRenderer]="fullWidthCellRenderer"
            [fullWidthCellRendererParams]="fullWidthCellRendererParams"
            [findSearchValue]="findSearchValue"
            (findChanged)="onFindChanged($event)"
            (gridReady)="onGridReady($event)"
        />
    </div> `,
})
export class AppComponent {
    @ViewChild('goToInput', { read: ElementRef }) public goToInput!: ElementRef;

    private gridApi!: GridApi;

    columnDefs: ColDef[] = [{ field: 'name' }, { field: 'continent' }, { field: 'language' }];
    defaultColDef: ColDef = {
        flex: 1,
    };
    rowData = getData();
    getRowHeight = (params: RowHeightParams) => {
        // return 100px height for full width rows
        if (this.isFullWidth(params.data)) {
            return 100;
        }
    };
    isFullWidthRow = (params: IsFullWidthRowParams) => {
        return this.isFullWidth(params.rowNode.data);
    };
    fullWidthCellRenderer = FullWidthCellRenderer;
    fullWidthCellRendererParams: FindFullWidthCellRendererParams = {
        getFindMatches: (params: GetFindMatchesParams) => {
            const getMatchesForValue = params.getMatchesForValue;
            // this example only implements searching across part of the renderer
            let numMatches = getMatchesForValue('Sample Text in a Paragraph');
            getLatinText().forEach((paragraph) => {
                numMatches += getMatchesForValue(paragraph);
            });
            return numMatches;
        },
    };

    activeMatchNum: string = '';

    findSearchValue: string | undefined;

    constructor() {}

    onFindChanged(event: FindChangedEvent) {
        const { activeMatch, totalMatches, findSearchValue } = event;
        this.activeMatchNum = findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '';
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

    private isFullWidth(data: any) {
        // return true when country is Peru, France or Italy
        return ['Peru', 'France', 'Italy'].indexOf(data.name) >= 0;
    }
}

import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    FindChangedEvent,
    GridApi,
    GridReadyEvent,
    ModuleRegistry,
    ValidationModule,
} from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';

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

    columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'year' },
        { field: 'age', minWidth: 100 },
        { field: 'gold', minWidth: 100 },
        { field: 'silver', minWidth: 100 },
        { field: 'bronze', minWidth: 100 },
    ];
    rowData!: any[];

    activeMatchNum: string = '';

    findSearchValue: string | undefined;

    constructor(private http: HttpClient) {}

    onFindChanged(event: FindChangedEvent) {
        const { activeMatch, totalMatches, findSearchValue } = event;
        this.activeMatchNum = findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '';
        console.log('findChanged', event);
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

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
    ValidationModule,
} from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';

import { FindRenderer } from './findRenderer.component';
import './styles.css';

ModuleRegistry.registerModules([FindModule, ClientSideRowModelModule, ValidationModule /* Development Only */]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular, FindRenderer],
    template: `<div class="example-wrapper">
        <div class="example-header">
            <div class="example-controls">
                <span>Find:</span>
                <input type="text" (input)="onInput($event)" (keydown)="onKeyDown($event)" value="e" />
                <button (click)="previous()">Previous</button>
                <button (click)="next()">Next</button>
                <span>{{ activeMatchNum }}</span>
            </div>
        </div>
        <ag-grid-angular
            style="width: 100%; height: 100%;"
            [columnDefs]="columnDefs"
            [rowData]="rowData"
            [findSearchValue]="findSearchValue"
            (findChanged)="onFindChanged($event)"
            (gridReady)="onGridReady($event)"
            (firstDataRendered)="onFirstDataRendered($event)"
        />
    </div> `,
})
export class AppComponent {
    private gridApi!: GridApi;

    columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'country' },
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
    ];
    rowData!: any[];

    activeMatchNum: string = '';

    findSearchValue: string | undefined = 'e';

    constructor(private http: HttpClient) {}

    onFindChanged(event: FindChangedEvent) {
        const { activeMatch, totalMatches, findSearchValue } = event;
        this.activeMatchNum = findSearchValue?.length ? `${activeMatch?.numOverall ?? 0}/${totalMatches}` : '';
    }

    onFirstDataRendered() {
        this.next();
    }

    next() {
        this.gridApi.findNext();
    }

    previous() {
        this.gridApi.findPrevious();
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

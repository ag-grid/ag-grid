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
            <span>Find:</span>
            <input type="text" id="find-text-box" />
            <button (click)="find()">Find</button>
            <button (click)="previous()">Previous</button>
            <button (click)="next()">Next</button>
            <span id="resultNum"></span>
        </div>
        <ag-grid-angular
            style="width: 100%; height: 100%;"
            [columnDefs]="columnDefs"
            [rowData]="rowData"
            (findChanged)="onFindChanged($event)"
            (gridReady)="onGridReady($event)"
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

    constructor(private http: HttpClient) {}

    onFindChanged(event: FindChangedEvent) {
        const { activeMatch, totalMatches } = event;
        (document.getElementById('resultNum') as HTMLElement).textContent = activeMatch
            ? `${activeMatch.numOverall}/${totalMatches}`
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

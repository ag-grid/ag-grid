import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    FindOptions,
    FirstDataRenderedEvent,
    GetDetailRowDataParams,
    GetFindMatchesParams,
    GetRowIdParams,
    IDetailCellRendererParams,
    ModuleRegistry,
    RowApiModule,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule, ToolbarModule } from 'ag-grid-enterprise';

import { getData } from './data';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([FindModule, ToolbarModule, ClientSideRowModelModule, MasterDetailModule, RowApiModule]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `<ag-grid-angular
        style="width: 100%; height: 100%;"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [rowData]="rowData"
        [masterDetail]="true"
        [getRowId]="getRowId"
        [detailCellRendererParams]="detailCellRendererParams"
        [findOptions]="findOptions"
        [toolbar]="toolbar"
        (firstDataRendered)="onFirstDataRendered($event)"
    /> `,
})
export class AppComponent {
    columnDefs: ColDef[] = [{ field: 'a1', cellRenderer: 'agGroupCellRenderer' }, { field: 'b1' }];
    defaultColDef: ColDef = {
        flex: 1,
    };
    rowData = getData();
    getRowId = (params: GetRowIdParams) => params.data.a1;
    findOptions: FindOptions = {
        searchDetail: true,
    };
    toolbar = {
        items: ['agFindToolbarItem' as const],
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

    onFirstDataRendered(event: FirstDataRenderedEvent) {
        event.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
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

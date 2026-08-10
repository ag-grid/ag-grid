import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GetRowIdParams, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    ValueCacheModule,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { getData } from './data';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ValueCacheModule,
    HighlightChangesModule,
    CellStyleModule,
    ClientSideRowModelModule,
    RowGroupingModule,
]);

let callCount = 1;

function formatNumber(params: ValueFormatterParams) {
    return Math.floor(params.value).toLocaleString();
}

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <div class="example-wrapper">
            <div class="example-header">
                Value Cache:
                <input
                    type="radio"
                    id="valueCacheOn"
                    name="valueCache"
                    [checked]="valueCacheOn"
                    (change)="onValueCache(true)"
                /><label for="valueCacheOn">On</label>
                <input
                    type="radio"
                    id="valueCacheOff"
                    name="valueCache"
                    [checked]="!valueCacheOn"
                    (change)="onValueCache(false)"
                /><label for="valueCacheOff">Off</label>
            </div>
            @if (isVisible) {
                <ag-grid-angular
                    style="width: 100%; height: 100%;"
                    [columnDefs]="columnDefs"
                    [defaultColDef]="defaultColDef"
                    [autoGroupColumnDef]="autoGroupColumnDef"
                    [columnTypes]="columnTypes"
                    [rowData]="rowData"
                    [valueCache]="valueCacheOn"
                    [suppressAggFuncInHeader]="true"
                    [groupDefaultExpanded]="1"
                    [getRowId]="getRowId"
                    (cellValueChanged)="onCellValueChanged()"
                />
            }
        </div>
    `,
})
export class AppComponent {
    public valueCacheOn = false;
    public isVisible = true;

    public columnDefs: ColDef[] = [
        { field: 'q1', type: 'quarterFigure' },
        { field: 'q2', type: 'quarterFigure' },
        { field: 'q3', type: 'quarterFigure' },
        { field: 'q4', type: 'quarterFigure' },
        { field: 'year', rowGroup: true, hide: true },
        {
            headerName: 'Total',
            colId: 'total',
            cellClass: ['number-cell', 'total-col'],
            aggFunc: 'sum',
            valueFormatter: formatNumber,
            valueGetter: (params: ValueGetterParams) => {
                const q1 = params.getValue('q1');
                const q2 = params.getValue('q2');
                const q3 = params.getValue('q3');
                const q4 = params.getValue('q4');
                const result = q1 + q2 + q3 + q4;
                console.log(
                    `Total Value Getter (${callCount}, ${params.column.getId()}): ${[q1, q2, q3, q4].join(', ')} =  ${result}`
                );
                callCount++;
                return result;
            },
        },
    ];
    public defaultColDef: ColDef = { flex: 1, enableCellChangeFlash: true };
    public autoGroupColumnDef: ColDef = { minWidth: 140 };
    public columnTypes = {
        quarterFigure: {
            cellClass: 'number-cell',
            aggFunc: 'sum',
            valueFormatter: formatNumber,
            valueParser: (params: { newValue: string }) => Number(params.newValue),
        },
    };
    public rowData: any[] = getData();
    public getRowId = (params: GetRowIdParams) => String(params.data.id);

    onValueCache(on: boolean) {
        // valueCache is an initial-only grid option, so toggling it requires a full
        // grid re-creation — remove then re-add the grid to pick up the new setting.
        callCount = 1;
        this.valueCacheOn = on;
        this.isVisible = false;
        setTimeout(() => (this.isVisible = true), 1);
    }

    onCellValueChanged() {
        console.log('onCellValueChanged');
    }
}

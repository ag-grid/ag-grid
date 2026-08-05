import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberEditorModule,
    RenderApiModule,
    TextEditorModule,
    enableDevValidations,
} from 'ag-grid-community';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    RenderApiModule,
    TextEditorModule,
    HighlightChangesModule,
    ClientSideRowModelModule,
    NumberEditorModule,
]);

interface LeftData {
    function: string;
    value: string;
}

interface RightData {
    a: number;
    b: number;
}

// Kept module-level and mutated in place so both the grid and the sum() closure
// always read the same row-data array after an edit.
const rowDataRight: RightData[] = [
    { a: 1, b: 22 },
    { a: 2, b: 33 },
    { a: 3, b: 44 },
    { a: 4, b: 55 },
    { a: 5, b: 66 },
    { a: 6, b: 77 },
    { a: 7, b: 88 },
];

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: /* html */ ` <div class="example-wrapper">
        <div class="item-header">
            Enter a number to analyse:
            <input type="text" (input)="onNewNumber($any($event.target).value)" />
        </div>
        <div class="item-header">Edit data on RHS, table updates on LHS</div>
        <ag-grid-angular
            class="grid-wrapper"
            [columnDefs]="leftColumnDefs"
            [defaultColDef]="leftDefaultColDef"
            [enableCellExpressions]="true"
            [rowData]="rowDataLeft"
            [context]="context"
            (gridReady)="onLeftGridReady($event)"
        />
        <ag-grid-angular
            class="grid-wrapper"
            [columnDefs]="rightColumnDefs"
            [defaultColDef]="rightDefaultColDef"
            [rowData]="rowDataRight"
        />
    </div>`,
})
export class AppComponent {
    leftApi!: GridApi;

    rowDataLeft: LeftData[] = [
        { function: 'Number Squared', value: '=ctx.theNumber * ctx.theNumber' },
        { function: 'Number x 2', value: '=ctx.theNumber * 2' },
        { function: "Today's Date", value: '=new Date().toLocaleDateString()' },
        { function: 'Sum A', value: '=ctx.sum("a")' },
        { function: 'Sum B', value: '=ctx.sum("b")' },
    ];

    rowDataRight = rowDataRight;

    context: { theNumber: any; sum: (field: keyof RightData) => number } = {
        theNumber: 4,
        sum: (field) => {
            let result = 0;
            rowDataRight.forEach((item) => {
                result += item[field];
            });
            return result;
        },
    };

    leftColumnDefs: ColDef<LeftData>[] = [
        { headerName: 'Function', field: 'function', minWidth: 150 },
        { headerName: 'Value', field: 'value' },
        {
            headerName: 'Times 10',
            valueGetter: 'typeof getValue("value") === "number" ? getValue("value") * 10 : null',
        },
    ];

    leftDefaultColDef: ColDef = {
        flex: 1,
        sortable: false,
        enableCellChangeFlash: true,
    };

    rightColumnDefs: ColDef<RightData>[] = [{ field: 'a' }, { field: 'b' }];

    rightDefaultColDef: ColDef = {
        flex: 1,
        width: 150,
        editable: true,
        onCellValueChanged: () => this.cellValueChanged(),
    };

    onLeftGridReady(params: GridReadyEvent) {
        this.leftApi = params.api;
    }

    // Tell the left grid to refresh when the number changes.
    onNewNumber(value: string) {
        this.context.theNumber = new Number(value);
        this.leftApi.refreshCells();
    }

    // Tell the left grid to refresh when the right grid values change.
    cellValueChanged() {
        this.leftApi.refreshCells();
    }
}

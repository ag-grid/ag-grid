import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    HighlightChangesModule,
    NumberEditorModule,
    RenderApiModule,
    TextEditorModule,
    enableDevValidations,
} from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

const modules = [
    RenderApiModule,
    TextEditorModule,
    HighlightChangesModule,
    ClientSideRowModelModule,
    NumberEditorModule,
];

interface LeftData {
    function: string;
    value: string;
}

interface RightData {
    a: number;
    b: number;
}

const rowDataLeft: LeftData[] = [
    { function: 'Number Squared', value: '=ctx.theNumber * ctx.theNumber' },
    { function: 'Number x 2', value: '=ctx.theNumber * 2' },
    { function: "Today's Date", value: '=new Date().toLocaleDateString()' },
    { function: 'Sum A', value: '=ctx.sum("a")' },
    { function: 'Sum B', value: '=ctx.sum("b")' },
];

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

const context: { theNumber: any; sum: (field: keyof RightData) => number } = {
    theNumber: 4,
    sum: (field) => {
        let result = 0;
        rowDataRight.forEach((item) => {
            result += item[field];
        });
        return result;
    },
};

const leftColumnDefs: ColDef<LeftData>[] = [
    { headerName: 'Function', field: 'function', minWidth: 150 },
    { headerName: 'Value', field: 'value' },
    { headerName: 'Times 10', valueGetter: 'typeof getValue("value") === "number" ? getValue("value") * 10 : null' },
];

const leftDefaultColDef: ColDef = {
    flex: 1,
    sortable: false,
    enableCellChangeFlash: true,
};

const rightColumnDefs: ColDef<RightData>[] = [{ field: 'a' }, { field: 'b' }];

const GridExample = () => {
    const [leftApi, setLeftApi] = useState<GridApi | null>(null);

    // Tell the left grid to refresh when the number changes.
    const onNewNumber = (value: string) => {
        context.theNumber = new Number(value);
        leftApi?.refreshCells();
    };

    // Tell the left grid to refresh when the right grid values change.
    const rightDefaultColDef: ColDef = {
        flex: 1,
        width: 150,
        editable: true,
        onCellValueChanged: () => leftApi?.refreshCells(),
    };

    return (
        <AgGridProvider modules={modules}>
            <div className="example-wrapper">
                <div className="item-header">
                    Enter a number to analyse:
                    <input type="text" onInput={(e) => onNewNumber(e.currentTarget.value)} />
                </div>
                <div className="item-header">Edit data on RHS, table updates on LHS</div>
                <div className="grid-wrapper">
                    <AgGridReact<LeftData>
                        columnDefs={leftColumnDefs}
                        defaultColDef={leftDefaultColDef}
                        enableCellExpressions={true}
                        rowData={rowDataLeft}
                        context={context}
                        onGridReady={(params: GridReadyEvent) => setLeftApi(params.api)}
                    />
                </div>
                <div className="grid-wrapper">
                    <AgGridReact<RightData>
                        columnDefs={rightColumnDefs}
                        defaultColDef={rightDefaultColDef}
                        rowData={rowDataRight}
                    />
                </div>
            </div>
        </AgGridProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);

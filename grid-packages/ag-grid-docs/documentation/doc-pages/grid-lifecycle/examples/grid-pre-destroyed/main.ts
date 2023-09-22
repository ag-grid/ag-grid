import { Grid, ColDef, GridApi, ColumnApi, GridOptions, GridReadyEvent, GridPreDestroyedEvent } from '@ag-grid-community/core';

import { getDataSet, TAthlete } from './data';

interface ColumnWidth {
    field: string;
    width: number;
}

var columnWidths: Map<string, number> | undefined = undefined;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'name', headerName: 'Athlete' },
        { field: 'medals.gold', headerName: 'Gold Medals' },
        { field: 'person.age', headerName: 'Age' },
    ],
    defaultColDef: {
        editable: true,
        resizable: true,
    },
    rowData: getDataSet(),
    onGridPreDestroyed: (params: GridPreDestroyedEvent<TAthlete>) => {
        const allColumns = params.columnApi?.getColumns();
        if (!allColumns) {
            return;
        }

        const currentColumnWidths = allColumns.map(column => ({
            field: column?.getColDef().field || '-',
            width: column?.getActualWidth(),
        }));

        displayColumnsWidth(currentColumnWidths);
        columnWidths = new Map(currentColumnWidths
            .map(columnWidth => [columnWidth.field, columnWidth.width])
        );
    }
};

const displayColumnsWidth = (values: ColumnWidth[]) => {
    const parentContainer = document.querySelector<HTMLElement>('#gridPreDestroyedState');
    const valuesContainer = parentContainer?.querySelector<HTMLElement>('.values');
    if (!parentContainer || !valuesContainer) {
        return;
    }

    const html = '<ul>'
        + (values || []).map(value => `<li>Field: ${value.field} | Width: ${value.width}px</li>`).join('')
        + '</ul>';

    parentContainer.style.display = 'block';
    valuesContainer.innerHTML = html;

    const exampleButtons = document.querySelector<HTMLElement>('#exampleButtons');
    exampleButtons!.style.display = 'none';
}

function updateColumnWidth() {
    if (!gridOptions.columnApi) {
        return;
    }

    gridOptions.columnApi.getColumns()!.forEach(column => {
        const newRandomWidth = Math.round((150 + Math.random() * 100) * 100) / 100;
        gridOptions.columnApi?.setColumnWidth(column, newRandomWidth);
    })
}

function destroyGrid() {
    if (!gridOptions.api) {
        return;
    }

    gridOptions.api.destroy();
    columnWidths = undefined;
}

function reloadGrid() {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    const updatedColDefs = gridOptions.columnDefs && columnWidths ?
        gridOptions.columnDefs.map(val => {
            const colDef = val as ColDef;
            const result: ColDef = {
                ...colDef,
            };

            if (colDef.field || colDef.width) {
                const width = colDef.field ? columnWidths?.get(colDef.field) : undefined
                result.width = typeof width === 'number' ? width : colDef.width;
            }

            return result;
        }) : gridOptions.columnDefs;

    new Grid(gridDiv, {
        ...gridOptions,
        columnDefs: updatedColDefs || gridOptions.columnDefs || []
    });

    const parentContainer = document.querySelector<HTMLElement>('#gridPreDestroyedState');
    parentContainer!.style.display = 'none';

    const exampleButtons = document.querySelector<HTMLElement>('#exampleButtons');
    exampleButtons!.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(gridDiv, gridOptions);
});

import {
    GridApi,
    createGrid,
    ColDef,
    GridApi,
    ColumnApi,
    GridOptions,
    GridReadyEvent,
    GridPreDestroyedEvent,
} from '@ag-grid-community/core';

import { getDataSet, TAthlete } from './data';

interface ColumnWidth {
    field: string;
    width: number;
}

var columnWidths: Map<string, number> | undefined = undefined;

let api: GridApi;

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
        const allColumns = params.api?.getColumns();
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
    if (!api) {
        return;
    }

    api.getColumns()!.forEach(column => {
        const newRandomWidth = Math.round((150 + Math.random() * 100) * 100) / 100;
        api?.setColumnWidth(column, newRandomWidth);
    })
}

function destroyGrid() {
    if (!api) {
        return;
    }

    api.destroy();
}

function reloadGrid() {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    const updatedColDefs = gridOptions.columnDefs && columnWidths ?
        gridOptions.columnDefs.map(val => {
            const colDef = val as ColDef;
            const result: ColDef = {
                ...colDef,
            };

            if(colDef.field){
                const restoredWidth = columnWidths?.get(colDef.field);
                if (restoredWidth) {
                    result.width = restoredWidth;
                }
            }

            return result;
        }) : gridOptions.columnDefs;

    gridOptions.columnDefs = updatedColDefs;

    api = createGrid(gridDiv, gridOptions);;

    const parentContainer = document.querySelector<HTMLElement>('#gridPreDestroyedState');
    parentContainer!.style.display = 'none';

    const exampleButtons = document.querySelector<HTMLElement>('#exampleButtons');
    exampleButtons!.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    api = createGrid(gridDiv, gridOptions);;
});

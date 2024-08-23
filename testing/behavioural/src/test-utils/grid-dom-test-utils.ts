import type { GridApi, IRowNode } from '@ag-grid-community/core';

import { getAllRows } from './grid-test-utils';

export function checkSimpleRowNodesDom(gridElement: Element | string, api: GridApi) {
    if (typeof gridElement === 'string') {
        const found = document.getElementById(gridElement);
        if (!found) {
            throw new Error(`Grid Element with id "${gridElement}" not found`);
        }
        gridElement = found;
    }

    for (const row of getAllRows(api)) {
        checkSimpleRowNodeDom(gridElement, api, row);
    }
}

export function checkSimpleRowNodeDom(gridElement: Element, api: GridApi, row: IRowNode) {
    const rowElement = gridElement.querySelector(`[row-id="${row.id}"]`);

    if (!rowElement) {
        throw new Error(`Missing row element id:${row.id}`);
    }

    if (row.isSelected()) {
        if (!rowElement.classList.contains('ag-row-selected')) {
            throw new Error(`Row id:${row.id} key:${row.key} should have ag-row-selected class`);
        }
    } else if (rowElement.classList.contains('ag-row-selected')) {
        throw new Error(`Row id:${row.id} key:${row.key} should not have ag-row-selected class`);
    }

    // Check for cell values
    const columns = api.getColumns() ?? [];
    for (let columnIndex = 0; columnIndex < columns.length; ++columnIndex) {
        const column = columns[columnIndex];

        const columnId = column.getColId();
        const cellElement = rowElement.querySelector(`[col-id="${columnId}"]`);
        if (!cellElement) {
            throw new Error(
                `Missing cell element for column id:"${columnId}" index:${columnIndex} in row id:${row.id} key:${row.key}`
            );
        }
        let cellValue = api.getCellValue({ rowNode: row, colKey: column, useFormatter: true });
        if (cellValue === null) {
            cellValue = '';
        }
        if (cellElement.textContent !== cellValue) {
            throw new Error(
                `Cell value mismatch for column id:"${columnId}" index:${columnIndex} in row id:${row.id} key:${row.key} : ` +
                    `expected '${cellValue}', found '${cellElement.textContent}'`
            );
        }
    }
}

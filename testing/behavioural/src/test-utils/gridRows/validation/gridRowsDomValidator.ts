import type { RowNode } from '@ag-grid-community/core';

import type { GridRows } from '../gridRows';

export class GridRowsDomValidator {
    public constructor(public readonly gridRows: GridRows) {}

    public validate() {
        const gridElement = this.gridRows.gridHtmlElement;
        if (!gridElement) {
            this.gridRows.errors.default.add('Grid HTMLElement found');
            return;
        }

        const rowElements = this.gridRows.rowsHtmlElements;
        const displayedRows = this.gridRows.displayedRows;
        const rowElementsIds = rowElements.map((rowElement) => rowElement.getAttribute('row-id') ?? '');

        if (rowElements.length !== displayedRows.length) {
            this.gridRows.errors.default.add(
                'Found ' + rowElements.length + ' row HTML elements, displayedRows.length is ' + displayedRows.length
            );
        }
        for (let index = 0; index < displayedRows.length; index++) {
            const row = displayedRows[index];
            if (this.gridRows.isDuplicateIdRow(row)) {
                continue;
            }

            const id = String(row.id);
            const rowElement = this.gridRows.getRowHtmlElement(id);
            if (!rowElement) {
                this.gridRows.errors.get(row).add('Row HTMLElement row-id=' + JSON.stringify(id) + ' not found');
                continue;
            }
            if (index < rowElementsIds.length && rowElementsIds[index] !== id) {
                this.gridRows.errors
                    .get(row)
                    .add(
                        'HTMLElement row.id=' +
                            JSON.stringify(rowElementsIds[index]) +
                            ' found instead, for row index ' +
                            index
                    );
            }
            this.checkRowDom(row, rowElement);
        }

        for (const element of rowElements) {
            const id = element.getAttribute('id');
            if (id !== null && !this.gridRows.isRowDisplayed(this.gridRows.getById(id))) {
                this.gridRows.errors.default.add(
                    'HTML row ' + JSON.stringify(id) + ' exists, but no displayed row with that id exists'
                );
            }
        }
    }

    checkRowDom(row: RowNode<any>, rowElement: HTMLElement) {
        const rowErrors = this.gridRows.errors.get(row);

        if (this.gridRows.options.checkSelectedNodes ?? true) {
            if (row.isSelected()) {
                if (!rowElement.classList.contains('ag-row-selected')) {
                    rowErrors.add('HTML element should have ag-row-selected class');
                }
            } else if (rowElement.classList.contains('ag-row-selected')) {
                rowErrors.add('HTML element should NOT have ag-row-selected class');
            }
        }

        // Check for cell values
        const columns = this.gridRows.api.getColumns() ?? [];
        for (let columnIndex = 0; columnIndex < columns.length; ++columnIndex) {
            const column = columns[columnIndex];

            const columnId = column.getColId();
            const cellElement = rowElement.querySelector(`[col-id="${CSS.escape(columnId)}"]`);
            if (!cellElement) {
                if (column.isVisible()) {
                    rowErrors.add(`Missing cell element for column id:"${columnId}" index:${columnIndex}`);
                }
                continue;
            }

            let cellValue = this.gridRows.api.getCellValue({ rowNode: row, colKey: column, useFormatter: true });
            if (cellValue === null) {
                cellValue = '';
            }

            if (cellElement.textContent !== cellValue) {
                if (row.group && this.gridRows.api.getGridOption('groupTotalRow')) {
                    // TODO: HACK: we are disabling checking the cell value due to AG-12716
                    // if group footers are visible, api.getCellValue return the aggregate value, but HTML cells shows the row data value
                    continue;
                }

                rowErrors.add(
                    `HTML cell value mismatch for column id:"${columnId}" index:${columnIndex}, expected ${JSON.stringify(cellValue)}, got ${JSON.stringify(cellElement.textContent)}`
                );
            }
        }
    }
}

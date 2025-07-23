import type { Column, IRowNode, RowNode } from 'ag-grid-community';

import type { GridRows } from '../gridRows';
import type { GridRowErrors, GridRowsErrors } from '../gridRowsErrors';

export class GridRowsDomValidator {
    public validatedRows = new Set<IRowNode>();
    public constructor(public readonly errors: GridRowsErrors) {}

    public validate(gridRows: GridRows<any>) {
        const gridElement = gridRows.gridHtmlElement;
        if (!gridElement) {
            gridRows.errors.default.add('Grid HTMLElement found');
            return;
        }

        const rowElements = gridRows.rowsHtmlElements;
        const displayedRows = gridRows.displayedRows;

        let duplicates = false;
        for (let index = 0; index < displayedRows.length; index++) {
            if (gridRows.isDuplicateIdRow(displayedRows[index])) {
                duplicates = true;
                break;
            }
        }

        const domOrderIsConsistent =
            !duplicates &&
            (!!gridRows.api.getGridOption('ensureDomOrder') || gridRows.api.getGridOption('domLayout') === 'print');

        const rowElementsIdsInOrder = !domOrderIsConsistent
            ? rowElements
                  .map((rowElement) => rowElement.getAttribute('row-id') ?? '')
                  .filter((x) => {
                      const row = gridRows.getById(x);
                      if (row && row.sticky) {
                          return false; // Let's ignore sticky rows as they might not be in order
                      }
                      return true;
                  })
            : null;

        let rowElementsIdsInOrderIdx = 0;

        for (let index = 0; index < displayedRows.length; index++) {
            const row = displayedRows[index];
            if (gridRows.isDuplicateIdRow(row)) {
                continue;
            }
            if (this.validatedRows.has(row)) {
                continue;
            }
            this.validatedRows.add(row);

            const stringId = String(row.id);
            const rowElement = gridRows.getRowHtmlElement(stringId);
            if (!rowElement) {
                if (row.id !== undefined) {
                    this.errors.get(row).add('Row HTMLElement row-id=' + JSON.stringify(stringId) + ' not found');
                }
                continue;
            }

            if (!row.sticky && !row.detail) {
                if (
                    rowElementsIdsInOrder &&
                    rowElementsIdsInOrderIdx < rowElementsIdsInOrder.length &&
                    rowElementsIdsInOrder[rowElementsIdsInOrderIdx] !== stringId
                ) {
                    gridRows.errors
                        .get(row)
                        .add(
                            'HTMLElement row.id=' +
                                JSON.stringify(rowElementsIdsInOrder[index]) +
                                ' found instead, for row index ' +
                                index
                        );
                }
                ++rowElementsIdsInOrderIdx;
            }
            this.checkRowDom(gridRows, row, rowElement);

            const detailGridRows = gridRows.getDetailGridRows(row);
            if (detailGridRows) {
                this.validate(detailGridRows);
            }
        }

        for (const element of rowElements) {
            const id = element.getAttribute('id');
            if (id !== null && !gridRows.isRowDisplayed(gridRows.getById(id))) {
                gridRows.errors.default.add(
                    'HTML row ' + JSON.stringify(id) + ' exists, but no displayed row with that id exists'
                );
            }
        }
    }

    checkRowDom(gridRows: GridRows<any>, row: RowNode<any>, rowElement: HTMLElement) {
        const rowErrors = gridRows.errors.get(row);

        if (gridRows.options.checkSelectedNodes ?? true) {
            if (row.isSelected()) {
                if (!rowElement.classList.contains('ag-row-selected')) {
                    rowErrors.add('HTML element should have ag-row-selected class, but has ' + rowElement.className);
                }
            } else if (rowElement.classList.contains('ag-row-selected')) {
                rowErrors.add('HTML element should NOT have ag-row-selected class, but has ' + rowElement.className);
            }
        }

        if (!row.detail) {
            this.checkRowDomCells(gridRows, row, rowElement, rowErrors);
        }
    }

    private checkRowDomCells(
        gridRows: GridRows<any>,
        row: RowNode<any>,
        rowElement: HTMLElement,
        rowErrors: GridRowErrors<any>
    ) {
        // Check for cell values
        const columns = gridRows.api.getAllGridColumns() ?? [];
        for (let columnIndex = 0; columnIndex < columns.length; ++columnIndex) {
            const column = columns[columnIndex];

            const columnId = column.getColId();
            const cellElement = rowElement.querySelector(`[col-id="${CSS.escape(columnId)}"]`);

            if (!cellElement) {
                if (column.isVisible() && !row.master && columnId !== 'ag-Grid-SelectionColumn') {
                    rowErrors.add(`Missing cell element for column id:"${columnId}"`);
                }
                continue;
            }

            this.checkRowDomCell(cellElement, gridRows, row, column, rowErrors);
        }
    }

    private checkRowDomCell(
        cellElement: Element,
        gridRows: GridRows<any>,
        row: RowNode<any>,
        column: Column<any>,
        rowErrors: GridRowErrors<any>
    ) {
        const columnId = column.getColId();
        const textContent = cellElement.textContent?.trim() ?? '';

        if (!textContent && columnId === 'ag-Grid-AutoColumn') {
            return; // Skip empty auto column as it might not have text content
        }

        let cellValue = gridRows.api.getCellValue({ rowNode: row, colKey: column, useFormatter: true });
        if (cellValue === null) {
            cellValue = '';
        }
        cellValue = String(cellValue).trim();

        if (columnId === 'ag-Grid-AutoColumn') {
            let childCountText = '';
            const suppressCount = gridRows.api.getGridOption('autoGroupColumnDef')?.cellRenderer?.suppressCount;
            const childCount = suppressCount ? 0 : row.allChildrenCount;
            if (childCount) {
                childCountText += `(${childCount})`;
            }
            if (textContent === childCountText) {
                cellValue = childCountText; // Is fine, it contains just the child count
            } else {
                cellValue = cellValue ? `${cellValue} ${childCountText}` : childCountText;
            }
        }

        if (textContent !== cellValue) {
            rowErrors.add(
                `HTML cell value mismatch for column id:"${columnId}", expected ${JSON.stringify(cellValue)}, got ${JSON.stringify(textContent)}`
            );
        }
    }
}

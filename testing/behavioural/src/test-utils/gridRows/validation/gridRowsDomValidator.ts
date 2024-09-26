import type { IRowNode, RowNode } from 'ag-grid-community';

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

            const id = String(row.id);
            const rowElement = gridRows.getRowHtmlElement(id);
            if (!rowElement) {
                this.errors.get(row).add('Row HTMLElement row-id=' + JSON.stringify(id) + ' not found');
                continue;
            }

            if (!row.sticky && !row.detail) {
                if (
                    rowElementsIdsInOrder &&
                    rowElementsIdsInOrderIdx < rowElementsIdsInOrder.length &&
                    rowElementsIdsInOrder[rowElementsIdsInOrderIdx] !== id
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

        if (!row.detail && !row.master) {
            this.checkRowDomCellValues(gridRows, row, rowElement, rowErrors);
        }
    }

    private checkRowDomCellValues(
        gridRows: GridRows<any>,
        row: RowNode<any>,
        rowElement: HTMLElement,
        rowErrors: GridRowErrors<any>
    ) {
        // Check for cell values
        const columns = gridRows.api.getColumns() ?? [];
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

            let cellValue = gridRows.api.getCellValue({ rowNode: row, colKey: column, useFormatter: true });
            if (cellValue === null) {
                cellValue = '';
            }

            if (cellElement.textContent !== cellValue) {
                if (row.group && gridRows.api.getGridOption('groupTotalRow')) {
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

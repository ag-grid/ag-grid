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
            const rowElements = gridRows.getRowHtmlElements(stringId);
            if (!rowElements.length) {
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
            this.checkRowDom(gridRows, row, rowElements);

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

    checkRowDom(gridRows: GridRows<any>, row: RowNode<any>, rowElements: HTMLElement[]) {
        const rowErrors = gridRows.errors.get(row);

        for (const rowElement of rowElements) {
            if (gridRows.options.checkSelectedNodes ?? true) {
                if (row.isSelected()) {
                    if (!rowElement.classList.contains('ag-row-selected')) {
                        rowErrors.add(
                            'HTML element should have ag-row-selected class, but has ' + rowElement.className
                        );
                    }
                } else if (rowElement.classList.contains('ag-row-selected')) {
                    rowErrors.add(
                        'HTML element should NOT have ag-row-selected class, but has ' + rowElement.className
                    );
                }
            }
        }

        if (!row.detail) {
            this.checkRowDomCells(gridRows, row, rowElements, rowErrors);
        }
    }

    private checkRowDomCells(
        gridRows: GridRows<any>,
        row: RowNode<any>,
        rowElements: HTMLElement[],
        rowErrors: GridRowErrors<any>
    ) {
        // Check for cell values
        const columns = gridRows.api.getAllGridColumns() ?? [];
        for (let columnIndex = 0; columnIndex < columns.length; ++columnIndex) {
            const column = columns[columnIndex];

            const columnId = column.getColId();
            const cellElement = this.findCellElement(rowElements, columnId);

            if (!cellElement) {
                if (column.isVisible() && !row.master && columnId !== 'ag-Grid-SelectionColumn') {
                    if (!column.getId().startsWith('pivot_')) {
                        rowErrors.add(`Missing cell element for column id:"${columnId}"`);
                    }
                }
                continue;
            }

            this.checkRowDomCell(cellElement, gridRows, row, column, rowErrors);
        }
    }

    private findCellElement(rowElements: HTMLElement[], columnId: string): HTMLElement | null {
        const selector = `[col-id="${CSS.escape(columnId)}"]`;
        for (const rowElement of rowElements) {
            const match = rowElement.querySelector(selector) as HTMLElement | null;
            if (match) {
                return match;
            }
        }
        return null;
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

        const isAutoGroupCol = columnId === 'ag-Grid-AutoColumn' || columnId.startsWith('ag-Grid-AutoColumn-');
        if (isAutoGroupCol) {
            let childCountText = '';
            const suppressCount = this.isGroupCountSuppressed(gridRows, column, true);
            const childCount = suppressCount ? 0 : row.allChildrenCount;
            if (childCount) {
                childCountText = `(${childCount})`;
            }

            const expectedText = cellValue ? `${cellValue} ${childCountText}`.trim() : childCountText;

            if (textContent === childCountText) {
                return;
            }
            if (textContent !== expectedText) {
                const groupHideOpenParents = !!gridRows.api.getGridOption('groupHideOpenParents');
                if (groupHideOpenParents && expectedText.endsWith(textContent)) {
                    return;
                }
                rowErrors.add(
                    `HTML cell value mismatch for column id:"${columnId}", expected ${JSON.stringify(expectedText)}, got ${JSON.stringify(textContent)}`
                );
            }
            return;
        }

        const hasGroupRendererDom = !!cellElement.querySelector('.ag-group-value');
        const colDef = column.getColDef();
        if (hasGroupRendererDom || !!colDef.showRowGroup) {
            const expectedGroupText = this.getExpectedGroupCellText(gridRows, row, column, cellValue);
            const shouldIgnoreMismatch =
                expectedGroupText !== undefined &&
                gridRows.api.getGridOption('groupHideOpenParents') &&
                expectedGroupText.endsWith(textContent);

            if (expectedGroupText !== undefined && !shouldIgnoreMismatch && textContent !== expectedGroupText) {
                rowErrors.add(
                    `HTML cell value mismatch for column id:"${columnId}", expected ${JSON.stringify(expectedGroupText)}, got ${JSON.stringify(textContent)}`
                );
            }
            return;
        }

        if (textContent !== cellValue) {
            rowErrors.add(
                `HTML cell value mismatch for column id:"${columnId}", expected ${JSON.stringify(cellValue)}, got ${JSON.stringify(textContent)}`
            );
        }
    }

    private getExpectedGroupCellText(
        gridRows: GridRows<any>,
        row: RowNode<any>,
        column: Column<any>,
        rawValue: string
    ): string | undefined {
        const colDef = column.getColDef();
        let valueText = rawValue?.trim?.() ?? '';

        if (!valueText && colDef.showRowGroup) {
            const groupKey = typeof colDef.showRowGroup === 'string' ? colDef.showRowGroup : column.getColId();
            const groupDataValue = row.groupData?.[groupKey];
            const fallback = row.key ?? '';
            valueText = String(groupDataValue ?? fallback ?? '').trim();
        }

        const suppressCount = this.isGroupCountSuppressed(gridRows, column, false);
        let childCountText = '';
        if (!suppressCount) {
            const childCount = row.allChildrenCount;
            if (childCount) {
                childCountText = `(${childCount})`;
            }
        }

        if (valueText) {
            return childCountText ? `${valueText} ${childCountText}` : valueText;
        }

        return childCountText;
    }

    private isGroupCountSuppressed(gridRows: GridRows<any>, column: Column<any>, isAutoGroupCol: boolean): boolean {
        const colDef = column.getColDef();
        const params = colDef.cellRendererParams as any;
        if (params && typeof params === 'object' && 'suppressCount' in params) {
            return !!params.suppressCount;
        }

        if (isAutoGroupCol) {
            const autoGroupParams = gridRows.api.getGridOption('autoGroupColumnDef')?.cellRendererParams as any;
            if (autoGroupParams && typeof autoGroupParams === 'object' && 'suppressCount' in autoGroupParams) {
                return !!autoGroupParams.suppressCount;
            }
        }

        return false;
    }
}

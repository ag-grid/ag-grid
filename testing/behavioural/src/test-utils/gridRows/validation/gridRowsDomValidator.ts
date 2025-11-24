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
        const colDef = column.getColDef();
        const cellRenderer = colDef?.cellRenderer;

        if (this.validateCheckboxCell(cellElement, row, column, rowErrors, gridRows)) {
            return;
        }

        if (!textContent && columnId === 'ag-Grid-AutoColumn') {
            return; // Skip empty auto column as it might not have text content
        }

        const api = gridRows.api;
        const cellValue = api.getCellValue({ rowNode: row, colKey: column, useFormatter: true });
        const stringCellValue = cellValue != null ? String(cellValue).trim() : '';

        const isAutoGroupCol = columnId === 'ag-Grid-AutoColumn' || columnId.startsWith('ag-Grid-AutoColumn-');
        const isGroupCol = (!cellRenderer && isAutoGroupCol) || cellRenderer === 'agGroupCellRenderer';
        if (isGroupCol) {
            let childCountText = '';
            const suppressCount = this.isGroupCountSuppressed(gridRows, column, true);
            const rowId = row.id != null ? String(row.id) : '';
            const isFooterRow = !!row.footer || rowId.startsWith('rowGroupFooter_');
            const childCount = suppressCount || isFooterRow ? 0 : row.allChildrenCount;
            if (childCount) {
                childCountText = `(${childCount})`;
            }

            if (textContent === childCountText) {
                return;
            }

            if (cellValue === null && textContent === '') {
                return;
            }

            let expectedText = stringCellValue ? `${stringCellValue} ${childCountText}` : childCountText;
            expectedText = expectedText.trim();

            if (textContent !== expectedText) {
                const groupHideOpenParents = !!api.getGridOption('groupHideOpenParents');
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
        if (hasGroupRendererDom || !!colDef.showRowGroup) {
            const expectedGroupText = this.getExpectedGroupCellText(gridRows, row, column, stringCellValue);
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

        if (textContent !== stringCellValue) {
            rowErrors.add(
                `HTML cell value mismatch for column id:"${columnId}", expected ${JSON.stringify(cellValue)}, got ${JSON.stringify(textContent)}`
            );
        }
    }

    private getExpectedGroupCellText(
        gridRows: GridRows<any>,
        row: RowNode<any>,
        column: Column<any>,
        valueText: string
    ): string | undefined {
        const colDef = column.getColDef();

        if (!valueText && colDef.showRowGroup) {
            const groupKey = typeof colDef.showRowGroup === 'string' ? colDef.showRowGroup : column.getColId();
            const groupDataValue = row.groupData?.[groupKey];
            const fallback = row.key ?? '';
            valueText = String(groupDataValue ?? fallback ?? '').trim();
        }

        const suppressCount = this.isGroupCountSuppressed(gridRows, column, false);
        const rowId = row.id != null ? String(row.id) : '';
        const isFooterRow = !!row.footer || rowId.startsWith('rowGroupFooter_');
        let childCountText = '';
        if (!suppressCount && !isFooterRow) {
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

    private validateCheckboxCell(
        cellElement: Element,
        row: RowNode<any>,
        column: Column<any>,
        rowErrors: GridRowErrors<any>,
        gridRows: GridRows<any>
    ): boolean {
        const columnId = column.getColId();
        if (columnId === 'ag-Grid-SelectionColumn') {
            return false;
        }

        const colDef = column.getColDef();
        const usesCheckboxRenderer = colDef?.cellRenderer === 'agCheckboxCellRenderer';
        const checkboxElement = cellElement.querySelector(
            '.ag-checkbox-input-wrapper,[aria-checked],[role="checkbox"],.ag-checkbox'
        );
        if (!usesCheckboxRenderer && !checkboxElement) {
            return false;
        }

        const cellValue = gridRows.api.getCellValue({ rowNode: row, colKey: column });

        if (!checkboxElement) {
            return true;
        }

        let expectedAria: string | null = null;
        if (cellValue === true) {
            expectedAria = 'true';
        } else if (cellValue === false) {
            expectedAria = 'false';
        } else if (cellValue == null) {
            expectedAria = 'mixed';
        }

        if (expectedAria === null) {
            return true;
        }

        const ariaSource = checkboxElement?.hasAttribute('aria-checked')
            ? checkboxElement
            : checkboxElement?.querySelector('[aria-checked]');
        const ariaChecked = ariaSource?.getAttribute('aria-checked') ?? '';
        if (ariaChecked !== expectedAria) {
            rowErrors.add(
                `HTML checkbox state mismatch for column id:"${columnId}", expected aria-checked=${expectedAria}, got ${ariaChecked}`
            );
        }

        return true;
    }
}

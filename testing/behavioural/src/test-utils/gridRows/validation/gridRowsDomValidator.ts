import type { Column, IRowNode, RowNode } from 'ag-grid-community';

import { getGridHTMLElement, getGridRowsHtmlElements, getRowHtmlElements } from '../gridHtmlRows';
import type { GridRows } from '../gridRows';
import type { GridRowErrors, GridRowsErrors } from '../gridRowsErrors';

const AUTO_GROUP_COL_ID = 'ag-Grid-AutoColumn';

export class GridRowsDomValidator {
    public validatedRows = new Set<IRowNode>();
    public constructor(public readonly errors: GridRowsErrors) {}

    public validate(gridRows: GridRows) {
        const gridElement = getGridHTMLElement(gridRows.api);
        if (!gridElement) {
            gridRows.errors.default.add('Grid HTMLElement found');
            return;
        }

        const gridContext = new GridRowDomValidator(gridRows);
        const domRowIds = getDomRowIds(gridRows);
        let domRowIdx = 0;
        const displayedRows = gridRows.displayedRows;

        for (let index = 0; index < displayedRows.length; index++) {
            const row = displayedRows[index];
            if (gridRows.isDuplicateIdRow(row) || this.validatedRows.has(row)) {
                continue;
            }

            this.validatedRows.add(row);
            const stringId = String(row.id);
            const rowElements = getRowHtmlElements(gridRows.api, stringId);

            if (!rowElements.length) {
                if (row.id !== undefined) {
                    this.errors.get(row).add('Row HTMLElement row-id=' + JSON.stringify(stringId) + ' not found');
                }
                continue;
            }

            if (!row.sticky && !row.detail) {
                domRowIdx = assertDomOrder(gridRows, row, domRowIds, stringId, domRowIdx);
            }

            gridContext.validateRow(row, rowElements);
            this.validateDetailGridRows(row, gridRows);
        }

        ensureDomRowsBelongToGrid(gridRows);
    }

    private validateDetailGridRows(row: RowNode<any>, gridRows: GridRows): void {
        const detailGridRows = gridRows.getDetailGridRows(row);
        if (detailGridRows) {
            this.validate(detailGridRows);
        }
    }
}

class GridRowDomValidator {
    private readonly columns: Column[];
    private readonly isGroupRowsDisplay: boolean;
    private readonly autoGroupColumn?: Column;

    public constructor(private readonly gridRows: GridRows) {
        const api = gridRows.api;
        this.columns = api.getAllGridColumns() ?? [];
        this.isGroupRowsDisplay = api.getGridOption('groupDisplayType') === 'groupRows';
        this.autoGroupColumn = this.lookupAutoGroupColumn();
    }

    public validateRow(row: RowNode<any>, rowElements: HTMLElement[]): void {
        const rowErrors = this.gridRows.errors.get(row);
        this.checkRowSelectionState(row, rowElements, rowErrors);

        if (row.detail) {
            return;
        }

        if (this.isGroupRowsDisplay && row.group) {
            this.validateGroupRow(row, rowElements, rowErrors);
            return;
        }

        for (const column of this.columns) {
            this.validateCell(row, column, rowElements, rowErrors);
        }
    }

    private validateGroupRow(row: RowNode<any>, rowElements: HTMLElement[], rowErrors: GridRowErrors<any>): void {
        const wrapper = this.findGroupRowsWrapper(rowElements);
        if (!wrapper) {
            rowErrors.add('Missing groupRows cell wrapper for full-width group row');
            return;
        }

        const expected = this.autoGroupColumn
            ? this.getExpectedGroupTextFromColumn(row, this.autoGroupColumn)
            : this.getGroupRowFallbackText(row);
        const actual = this.getGroupRowsActualText(wrapper);

        if (expected !== actual) {
            rowErrors.add(
                `HTML groupRows value mismatch, expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
            );
        }
    }

    private validateCell(
        row: RowNode<any>,
        column: Column<any>,
        rowElements: HTMLElement[],
        rowErrors: GridRowErrors<any>
    ): void {
        const columnId = column.getColId();
        const cellElement = this.findCellElement(rowElements, columnId);

        if (!cellElement) {
            if (this.shouldReportMissingCell(row, column)) {
                rowErrors.add(`Missing cell element for column id:"${columnId}"`);
            }
            return;
        }

        if (this.validateCheckboxCell(cellElement, row, column, rowErrors)) {
            return;
        }

        const textContent = cellElement.textContent?.trim() ?? '';
        if (!textContent && this.isAutoGroupColumn(columnId)) {
            return;
        }

        const api = this.gridRows.api;
        const cellValue = api.getCellValue({ rowNode: row, colKey: column, useFormatter: true });
        const stringCellValue = cellValue != null ? String(cellValue).trim() : '';
        const colDef = column.getColDef();
        const cellRenderer = colDef?.cellRenderer;
        const isGroupCol =
            (!cellRenderer && this.isAutoGroupColumn(columnId)) || cellRenderer === 'agGroupCellRenderer';

        if (isGroupCol) {
            const childCountText = this.getChildCountText(row, this.isGroupCountSuppressed(column, true));

            if (textContent === childCountText || (cellValue === null && textContent === '')) {
                return;
            }

            const expected = this.combineGroupValue(stringCellValue, childCountText);
            if (textContent === expected) {
                return;
            }
            if (!this.shouldIgnoreGroupMismatch(expected, textContent)) {
                rowErrors.add(
                    `HTML cell value mismatch for column id:"${columnId}", expected ${JSON.stringify(expected)}, got ${JSON.stringify(textContent)}`
                );
            }
            return;
        }

        const hasGroupRendererDom = !!cellElement.querySelector('.ag-group-value');
        if (hasGroupRendererDom || !!colDef.showRowGroup) {
            const expected = this.getExpectedGroupCellText(row, column, stringCellValue);
            if (expected === undefined) {
                return;
            }
            if (textContent === expected) {
                return;
            }
            if (!this.shouldIgnoreGroupMismatch(expected, textContent)) {
                rowErrors.add(
                    `HTML cell value mismatch for column id:"${columnId}", expected ${JSON.stringify(expected)}, got ${JSON.stringify(textContent)}`
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

    private checkRowSelectionState(row: RowNode<any>, rowElements: HTMLElement[], rowErrors: GridRowErrors<any>): void {
        if (!(this.gridRows.options.checkSelectedNodes ?? true)) {
            return;
        }

        const isSelected = !!row.isSelected();
        for (const rowElement of rowElements) {
            const hasSelectedClass = rowElement.classList.contains('ag-row-selected');
            if (isSelected && !hasSelectedClass) {
                rowErrors.add('HTML element should have ag-row-selected class, but has ' + rowElement.className);
            } else if (!isSelected && hasSelectedClass) {
                rowErrors.add('HTML element should NOT have ag-row-selected class, but has ' + rowElement.className);
            }
        }
    }

    private shouldIgnoreGroupMismatch(expected: string, actual: string): boolean {
        return !!this.gridRows.api.getGridOption('groupHideOpenParents') && expected.endsWith(actual);
    }

    private shouldReportMissingCell(row: RowNode<any>, column: Column<any>): boolean {
        if (!column.isVisible() || row.master) {
            return false;
        }

        const columnId = column.getColId();
        if (columnId === 'ag-Grid-SelectionColumn') {
            return false;
        }

        return !column.getId().startsWith('pivot_');
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

    private findGroupRowsWrapper(rowElements: HTMLElement[]): HTMLElement | null {
        for (const rowElement of rowElements) {
            const wrapper = rowElement.querySelector('.ag-cell-wrapper.ag-row-group');
            if (wrapper) {
                return wrapper as HTMLElement;
            }
        }
        return null;
    }

    private getExpectedGroupCellText(row: RowNode<any>, column: Column<any>, valueText: string): string | undefined {
        const colDef = column.getColDef();

        if (!valueText && colDef.showRowGroup) {
            const groupKey = typeof colDef.showRowGroup === 'string' ? colDef.showRowGroup : column.getColId();
            const groupDataValue = row.groupData?.[groupKey];
            const fallback = row.key ?? '';
            valueText = String(groupDataValue ?? fallback ?? '').trim();
        }

        if (!valueText) {
            valueText = this.getBlankGroupLabel(row) ?? '';
        }

        const childCountText = this.getChildCountText(row, this.isGroupCountSuppressed(column, false));
        if (valueText) {
            return this.combineGroupValue(valueText, childCountText);
        }
        return childCountText;
    }

    private getExpectedGroupTextFromColumn(row: RowNode<any>, column: Column<any>): string {
        const cellValue = this.gridRows.api.getCellValue({ rowNode: row, colKey: column, useFormatter: true });
        const stringCellValue = cellValue != null ? String(cellValue).trim() : '';
        return this.getExpectedGroupCellText(row, column, stringCellValue) ?? '';
    }

    private getGroupRowFallbackText(row: RowNode<any>): string {
        let valueText = String(row.key ?? '').trim();
        if (!valueText) {
            valueText = this.getBlankGroupLabel(row) ?? '';
        }
        const childCount = row.allChildrenCount ?? 0;
        const childCountText = childCount ? `(${childCount})` : '';
        return valueText && childCountText ? `${valueText} ${childCountText}` : valueText || childCountText;
    }

    private getGroupRowsActualText(wrapper: HTMLElement): string {
        const value = wrapper.querySelector('.ag-group-value')?.textContent?.trim() ?? '';
        const childCount = wrapper.querySelector('.ag-group-child-count')?.textContent?.trim() ?? '';
        return value && childCount ? `${value} ${childCount}` : value || childCount;
    }

    private isGroupCountSuppressed(column: Column<any>, isAutoGroupCol: boolean): boolean {
        const colDef = column.getColDef();
        const params = colDef.cellRendererParams as any;
        if (params && typeof params === 'object' && 'suppressCount' in params) {
            return !!params.suppressCount;
        }

        if (isAutoGroupCol) {
            const autoGroupParams = this.gridRows.api.getGridOption('autoGroupColumnDef')?.cellRendererParams as any;
            if (autoGroupParams && typeof autoGroupParams === 'object' && 'suppressCount' in autoGroupParams) {
                return !!autoGroupParams.suppressCount;
            }
        }

        return false;
    }

    private getChildCountText(row: RowNode<any>, suppressCount: boolean): string {
        if (suppressCount) {
            return '';
        }

        const rowId = row.id != null ? String(row.id) : '';
        const isFooterRow = !!row.footer || rowId.startsWith('rowGroupFooter_');
        if (isFooterRow) {
            return '';
        }

        const childCount = row.allChildrenCount ?? 0;
        return childCount ? `(${childCount})` : '';
    }

    private combineGroupValue(valueText: string, childCountText: string): string {
        return valueText ? (childCountText ? `${valueText} ${childCountText}` : valueText) : childCountText;
    }

    private getBlankGroupLabel(row: RowNode<any>): string | undefined {
        if (!row.group) {
            return undefined;
        }

        const key = row.key;
        if (key === undefined || key === null) {
            return '(Blanks)';
        }

        return String(key).trim() === '' ? '(Blanks)' : undefined;
    }

    private validateCheckboxCell(
        cellElement: Element,
        row: RowNode<any>,
        column: Column<any>,
        rowErrors: GridRowErrors<any>
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

        const cellValue = this.gridRows.api.getCellValue({ rowNode: row, colKey: column });

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

    private lookupAutoGroupColumn(): Column | undefined {
        const direct = this.gridRows.api.getColumn(AUTO_GROUP_COL_ID);
        if (direct) {
            return direct;
        }

        return this.gridRows.api.getAllGridColumns()?.find((col) => this.isAutoGroupColumn(col.getColId()));
    }

    private isAutoGroupColumn(columnId: string): boolean {
        return columnId === AUTO_GROUP_COL_ID || columnId.startsWith(`${AUTO_GROUP_COL_ID}-`);
    }
}

function getDomRowIds(gridRows: GridRows): string[] | null {
    const displayedRows = gridRows.displayedRows;
    const hasDuplicates = displayedRows.some((row) => gridRows.isDuplicateIdRow(row));
    const ensureDomOrder = !!gridRows.api.getGridOption('ensureDomOrder');
    const domLayoutPrint = gridRows.api.getGridOption('domLayout') === 'print';
    const shouldCheckDomOrder = hasDuplicates || (!ensureDomOrder && !domLayoutPrint);

    if (!shouldCheckDomOrder) {
        return null;
    }

    const rowElements = getGridRowsHtmlElements(gridRows.api);
    return rowElements
        .map((rowElement) => rowElement.getAttribute('row-id') ?? '')
        .filter((id) => {
            const row = gridRows.getById(id);
            return !(row && row.sticky);
        });
}

function assertDomOrder(
    gridRows: GridRows,
    row: RowNode<any>,
    domRowIds: string[] | null,
    rowId: string,
    domIndex: number
): number {
    if (!domRowIds || domIndex >= domRowIds.length) {
        return domIndex;
    }

    if (domRowIds[domIndex] !== rowId) {
        gridRows.errors
            .get(row)
            .add(
                'HTMLElement row.id=' +
                    JSON.stringify(domRowIds[domIndex]) +
                    ' found instead, for row index ' +
                    domIndex
            );
    }
    return domIndex + 1;
}

function ensureDomRowsBelongToGrid(gridRows: GridRows): void {
    const rowElements = getGridRowsHtmlElements(gridRows.api);
    for (const element of rowElements) {
        const id = element.getAttribute('id');
        if (id !== null && !gridRows.isRowDisplayed(gridRows.getById(id))) {
            gridRows.errors.default.add(
                'HTML row ' + JSON.stringify(id) + ' exists, but no displayed row with that id exists'
            );
        }
    }
}

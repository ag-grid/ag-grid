import type { AgColumn, Column, GridApi, RowNode } from 'ag-grid-community';

import { valuesEqual } from '../grid-rows-helpers';
import { getGridHTMLElement, parseSpannedCell } from '../gridHtmlRows';
import type { GridRows } from '../gridRows';
import type { GridRowErrors } from '../rows-validation/gridRowErrors';
import {
    AUTO_GROUP_COL_ID,
    cellValueMismatchMsg,
    combineGroupValue,
    findCellElement,
    findGroupRowsWrapper,
    getGroupRowsActualText,
    hasSuppressCount,
    isAutoGroupColumn,
} from './cell-helpers';

/** Validates cell-level DOM content for a single row against the grid model. */
export class GridRowDomCellValidator {
    private readonly api: GridApi;
    private readonly columns: Column[];
    private readonly displayedColumnIds: Set<string>;
    private readonly displayedSections: Column[][];
    private readonly isGroupRowsDisplay: boolean;
    private readonly autoGroupColumn?: Column;
    /** colId → `${pinned}#${rowIndex}` keys covered by a .ag-spanned-row (excluding the anchor).
     *  Pinned is part of the key so a centre span doesn't mark a pinned row at the same index. */
    private readonly rowSpanCoveredIndexes: Map<string, Set<string>>;
    /** ids inside the current virtual column range, or null when virtualisation is suppressed. */
    private readonly colVirtIds: Set<string> | null;

    public constructor(private readonly gridRows: GridRows) {
        const api = gridRows.api;
        this.api = api;
        const hasColumnApi = (api.isModuleRegistered as (n: string) => boolean)('ColumnApi');
        this.columns = hasColumnApi ? (api.getAllGridColumns() ?? []) : [];
        this.displayedSections = hasColumnApi
            ? [
                  api.getDisplayedLeftColumns?.() ?? [],
                  api.getDisplayedCenterColumns?.() ?? [],
                  api.getDisplayedRightColumns?.() ?? [],
              ]
            : [[], [], []];
        this.displayedColumnIds = new Set(this.displayedSections.flat().map((c) => c.getColId()));
        this.isGroupRowsDisplay = api.getGridOption('groupDisplayType') === 'groupRows';
        this.autoGroupColumn = this.lookupAutoGroupColumn();
        this.rowSpanCoveredIndexes = this.collectRowSpanCoverage();
        // Permissive when virt isn't suppressed; getAllDisplayedVirtualColumns() returns the full
        // displayed set when viewport=0 (mocked layout), so this stays correct there too.
        this.colVirtIds =
            hasColumnApi && api.getGridOption?.('suppressColumnVirtualisation') !== true
                ? new Set((api.getAllDisplayedVirtualColumns?.() ?? []).map((c) => c.getColId()))
                : null;
    }

    private collectRowSpanCoverage(): Map<string, Set<string>> {
        const result = new Map<string, Set<string>>();
        const rootEl = getGridHTMLElement(this.api);
        if (!rootEl) {
            return result;
        }
        const spannedCells = rootEl.querySelectorAll('.ag-spanned-row [col-id]');
        for (const cellNode of Array.from(spannedCells)) {
            const info = parseSpannedCell(cellNode);
            if (!info) {
                continue;
            }
            const { colId, pinned, anchorIndex, span } = info;
            let covered = result.get(colId);
            if (!covered) {
                covered = new Set<string>();
                result.set(colId, covered);
            }
            for (let i = 1; i < span; ++i) {
                covered.add(`${pinned}#${anchorIndex + i}`);
            }
        }
        return result;
    }

    private computeColSpanCoveredIds(row: RowNode<any>): Set<string> {
        const covered = new Set<string>();
        for (const section of this.displayedSections) {
            for (let i = 0, len = section.length; i < len; ++i) {
                const span = section[i].getColSpan(row);
                if (span > 1) {
                    for (let j = 1; j < span && i + j < len; ++j) {
                        covered.add(section[i + j].getColId());
                    }
                }
            }
        }
        return covered;
    }

    public validateRow(row: RowNode<any>, rowElements: HTMLElement[]): void {
        const rowErrors = this.gridRows.errors.get(row);

        if (row.detail) {
            return;
        }

        // Full-width rows render a single full-width cell (the grid marks them `ag-full-width-row`)
        // and must NOT render any per-column cells.
        if (rowElements.some((el) => el.classList.contains('ag-full-width-row'))) {
            this.validateFullWidthRow(rowElements, rowErrors);
            return;
        }

        if (this.isGroupRowsDisplay && row.group) {
            this.validateGroupRow(row, rowElements, rowErrors);
            return;
        }

        const coveredByColSpan = this.computeColSpanCoveredIds(row);
        for (const column of this.columns) {
            this.validateCell(row, column, rowElements, rowErrors, coveredByColSpan);
        }
    }

    private validateFullWidthRow(rowElements: HTMLElement[], rowErrors: GridRowErrors<any>): void {
        for (const column of this.columns) {
            const columnId = column.getColId();
            rowErrors.add(
                findCellElement(rowElements, columnId) &&
                    `Unexpected per-column cell id:"${columnId}" rendered for a full-width row`
            );
        }
    }

    private validateGroupRow(row: RowNode<any>, rowElements: HTMLElement[], rowErrors: GridRowErrors<any>): void {
        const wrapper = findGroupRowsWrapper(rowElements);
        rowErrors.add(!wrapper && 'Missing groupRows cell wrapper for full-width group row');
        if (!wrapper) {
            return;
        }

        const expected = this.autoGroupColumn
            ? this.getExpectedGroupTextFromColumn(row, this.autoGroupColumn)
            : this.getGroupRowFallbackText(row);
        const actual = getGroupRowsActualText(wrapper);

        rowErrors.add(
            expected !== actual &&
                `HTML groupRows value mismatch, expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
        );
    }

    private validateCell(
        row: RowNode<any>,
        column: Column<any>,
        rowElements: HTMLElement[],
        rowErrors: GridRowErrors<any>,
        coveredByColSpan: Set<string>
    ): void {
        const columnId = column.getColId();
        const cellElement = findCellElement(rowElements, columnId);
        const isCovered =
            coveredByColSpan.has(columnId) ||
            (typeof row.rowIndex === 'number' &&
                this.rowSpanCoveredIndexes.get(columnId)?.has(`${row.rowPinned ?? ''}#${row.rowIndex}`) === true);

        rowErrors.add(
            !cellElement &&
                !isCovered &&
                this.shouldReportMissingCell(row, column) &&
                `Missing cell element for column id:"${columnId}"`
        );
        rowErrors.add(
            cellElement && isCovered && `Cell present for column id:"${columnId}" but column is covered by a span`
        );
        rowErrors.add(
            cellElement &&
                !isCovered &&
                this.isUnexpectedCell(row, column) &&
                `Unexpected cell element for column id:"${columnId}" — column is not displayed`
        );
        if (!cellElement) {
            return;
        }

        if (this.gridRows.options.domCellValidator?.({ row, column, cellElement, rowErrors }) === false) {
            return;
        }

        if (this.gridRows.checkEditState) {
            const cellHasActiveEditor = this.gridRows.isCellActivelyEditing(row, columnId);

            const hasInlineEditingClass = cellElement.classList.contains('ag-cell-inline-editing');
            const hasPopupEditingClass = cellElement.classList.contains('ag-cell-popup-editing');
            const hasAnyEditingClass = hasInlineEditingClass || hasPopupEditingClass;
            rowErrors.add(
                cellHasActiveEditor &&
                    !hasAnyEditingClass &&
                    `Cell id:"${columnId}" should have ag-cell-inline-editing or ag-cell-popup-editing class but does not`
            );
            rowErrors.add(
                !cellHasActiveEditor &&
                    hasInlineEditingClass &&
                    `Cell id:"${columnId}" should NOT have ag-cell-inline-editing class`
            );
            rowErrors.add(
                !cellHasActiveEditor &&
                    hasPopupEditingClass &&
                    `Cell id:"${columnId}" should NOT have ag-cell-popup-editing class`
            );

            // Group/footer rows inherit ag-cell-editing from leaf children via _hasLeafEdits — skip them.
            // Also skip cells without an actual pending edit: the data/batch comparison below uses
            // reference equality, so a non-deterministic `valueGetter` (one that allocates a fresh
            // object per call) would otherwise spuriously report a mismatch on every cell.
            if (
                this.gridRows.checkBatchState &&
                !row.group &&
                !row.footer &&
                this.gridRows.isCellEditing(row, columnId)
            ) {
                const hasCellEditingClass = cellElement.classList.contains('ag-cell-editing');
                const hasBatchEditClass = cellElement.classList.contains('ag-cell-batch-edit');

                // ag-cell-editing reflects pendingValue !== sourceValue, not editor presence.
                const batchValue = this.api.getCellValue({
                    rowNode: row,
                    colKey: column,
                    useFormatter: false,
                    from: 'batch',
                });
                const dataValue = this.api.getCellValue({
                    rowNode: row,
                    colKey: column,
                    useFormatter: false,
                    from: 'data',
                });
                const cellHasBatchChange = !valuesEqual(batchValue, dataValue);

                rowErrors.add(
                    cellHasBatchChange &&
                        !hasCellEditingClass &&
                        `Cell id:"${columnId}" should have ag-cell-editing class but does not`
                );
                rowErrors.add(
                    !cellHasBatchChange &&
                        hasCellEditingClass &&
                        `Cell id:"${columnId}" should NOT have ag-cell-editing class`
                );
                rowErrors.add(
                    hasBatchEditClass &&
                        !hasCellEditingClass &&
                        `Cell id:"${columnId}" has ag-cell-batch-edit but missing ag-cell-editing`
                );
            }

            if (cellHasActiveEditor) {
                this.validateEditorInput(cellElement, row, column, rowErrors);
                return;
            }
        }

        if (this.validateCheckboxCell(cellElement, row, column, rowErrors)) {
            return;
        }

        const textContent = cellElement.textContent?.trim() ?? '';
        if (!textContent && isAutoGroupColumn(columnId)) {
            return;
        }

        const cellValue = this.api.getCellValue({
            rowNode: row,
            colKey: column,
            useFormatter: true,
            transformValues: (column as AgColumn).showValuesAs != null,
        });
        const stringCellValue = cellValue != null ? String(cellValue).trim() : '';
        const colDef = column.getColDef();
        const cellRenderer = colDef?.cellRenderer;
        const isGroupCol = (!cellRenderer && isAutoGroupColumn(columnId)) || cellRenderer === 'agGroupCellRenderer';

        if (isGroupCol) {
            // Under groupHideOpenParents a leaf shows the ancestor's value + ancestor's child count.
            const showRowGroup = colDef.showRowGroup;
            const groupKey =
                typeof showRowGroup === 'string' ? showRowGroup : showRowGroup === true ? columnId : undefined;
            const countSource =
                !row.group && groupKey && this.api.getGridOption('groupHideOpenParents')
                    ? (findAncestorForGroupKey(row, groupKey) ?? row)
                    : row;
            const childCountText = this.getChildCountText(countSource, this.isGroupCountSuppressed(column, true));
            if (textContent === childCountText || (cellValue === null && textContent === '')) {
                return;
            }
            const expected = combineGroupValue(stringCellValue, childCountText);
            this.reportGroupCellMismatch(rowErrors, columnId, expected, textContent);
            return;
        }

        const hasGroupRendererDom = !!cellElement.querySelector('.ag-group-value');
        const showRowGroup = colDef.showRowGroup;
        // Unresolved `showRowGroup: '<colId>'` on a group row → empty groupData → rendered as a regular cell.
        const hasResolvedShowRowGroup =
            showRowGroup === true ||
            (typeof showRowGroup === 'string' && (!row.group || !!row.groupData?.[showRowGroup]));
        if (hasGroupRendererDom || hasResolvedShowRowGroup) {
            const expected = this.getExpectedGroupCellText(row, column, stringCellValue);
            if (expected !== undefined) {
                this.reportGroupCellMismatch(rowErrors, columnId, expected, textContent);
            }
            return;
        }

        if (textContent === stringCellValue) {
            return;
        }
        // Function/class renderers may wrap the value; tolerate that, but flag when the value is
        // missing entirely (an empty cellValue + non-empty text is fine — renderer-controlled).
        if (typeof cellRenderer === 'function' && (!stringCellValue || textContent.includes(stringCellValue))) {
            return;
        }
        rowErrors.add(cellValueMismatchMsg(columnId, cellValue, textContent));
    }

    private reportGroupCellMismatch(
        rowErrors: GridRowErrors<any>,
        columnId: string,
        expected: string,
        actual: string
    ): void {
        rowErrors.add(
            actual !== expected &&
                !this.shouldIgnoreGroupMismatch(expected, actual) &&
                cellValueMismatchMsg(columnId, expected, actual)
        );
    }

    private shouldIgnoreGroupMismatch(expected: string, actual: string): boolean {
        return !!this.api.getGridOption('groupHideOpenParents') && expected.endsWith(actual);
    }

    private shouldReportMissingCell(row: RowNode<any>, column: Column<any>): boolean {
        if (row.master) {
            return false;
        }
        const colId = column.getColId();
        if (!this.displayedColumnIds.has(colId)) {
            return false;
        }
        // With virtualisation, off-screen columns are absent from every row's DOM.
        if (this.colVirtIds && !this.colVirtIds.has(colId)) {
            return false;
        }
        return true;
    }

    private isUnexpectedCell(row: RowNode<any>, column: Column<any>): boolean {
        if (row.master || row.detail) {
            return false;
        }
        const columnId = column.getColId();
        if (columnId === 'ag-Grid-SelectionColumn') {
            return false;
        }
        return !this.displayedColumnIds.has(columnId);
    }

    private getExpectedGroupCellText(row: RowNode<any>, column: Column<any>, valueText: string): string | undefined {
        const colDef = column.getColDef();
        const groupKey = colDef.showRowGroup
            ? typeof colDef.showRowGroup === 'string'
                ? colDef.showRowGroup
                : column.getColId()
            : undefined;

        if (!valueText && groupKey) {
            const groupDataValue = row.groupData?.[groupKey];
            const fallback = row.key ?? '';
            valueText = String(groupDataValue ?? fallback ?? '').trim();
        }

        if (!valueText) {
            valueText = this.getBlankGroupLabel(row) ?? '';
        }

        // Under groupHideOpenParents a leaf shows the ancestor's value + ancestor's child count.
        const countSource =
            !row.group && groupKey && this.api.getGridOption('groupHideOpenParents')
                ? (findAncestorForGroupKey(row, groupKey) ?? row)
                : row;
        const childCountText = this.getChildCountText(countSource, this.isGroupCountSuppressed(column, false));
        if (valueText) {
            return combineGroupValue(valueText, childCountText);
        }
        return childCountText;
    }

    private getExpectedGroupTextFromColumn(row: RowNode<any>, column: Column<any>): string {
        const cellValue = this.api.getCellValue({
            rowNode: row,
            colKey: column,
            useFormatter: true,
            transformValues: (column as AgColumn).showValuesAs != null,
        });
        const stringCellValue = cellValue != null ? String(cellValue).trim() : '';
        return this.getExpectedGroupCellText(row, column, stringCellValue) ?? '';
    }

    private getGroupRowFallbackText(row: RowNode<any>): string {
        let valueText = String(row.key ?? '').trim();
        if (!valueText) {
            valueText = this.getBlankGroupLabel(row) ?? '';
        }
        const childCount = row.allChildrenCount ?? 0;
        return combineGroupValue(valueText, childCount ? `(${childCount})` : '');
    }

    private isGroupCountSuppressed(column: Column<any>, isAutoGroupCol: boolean): boolean {
        const result = hasSuppressCount(column.getColDef().cellRendererParams);
        if (result !== undefined) {
            return result;
        }
        if (!isAutoGroupCol) {
            return false;
        }
        return hasSuppressCount(this.api.getGridOption('autoGroupColumnDef')?.cellRendererParams) ?? false;
    }

    private getChildCountText(row: RowNode<any>, suppressCount: boolean): string {
        if (suppressCount || row.footer || String(row.id ?? '').startsWith('rowGroupFooter_')) {
            return '';
        }
        const childCount = row.allChildrenCount ?? 0;
        return childCount ? `(${childCount})` : '';
    }

    private getBlankGroupLabel(row: RowNode<any>): string | undefined {
        const key = row.group ? row.key : undefined;
        if (key === undefined || key === null) {
            return row.group ? '(Blanks)' : undefined;
        }
        return String(key).trim() === '' ? '(Blanks)' : undefined;
    }

    private validateEditorInput(
        cellElement: HTMLElement,
        row: RowNode<any>,
        column: Column<any>,
        rowErrors: GridRowErrors<any>
    ): void {
        const input = cellElement.querySelector<HTMLInputElement | HTMLTextAreaElement>(
            '.ag-cell-editor input.ag-input-field-input, .ag-cell-editor textarea'
        );
        if (!input) {
            // Popup/custom editor — input lives outside the cell.
            return;
        }
        const editValue = this.api.getCellValue({ rowNode: row, colKey: column, useFormatter: false, from: 'edit' });
        const expectedForms = editValueAlternatives(editValue);
        const actualStr = input.value ?? '';

        // getCellValue(from:'edit') is the last synced value — Backspace-start clears the input before sync.
        if (actualStr === '' && expectedForms[0] !== '') {
            return;
        }

        const columnId = column.getColId();
        rowErrors.add(
            !expectedForms.includes(actualStr) &&
                `Editor input value mismatch for column id:"${columnId}", expected one of ${JSON.stringify(expectedForms)}, got ${JSON.stringify(actualStr)}`
        );
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
        const checkboxElement = cellElement.querySelector<HTMLElement>(
            '.ag-checkbox-input-wrapper,[aria-checked],[role="checkbox"],.ag-checkbox'
        );
        if (!usesCheckboxRenderer && !checkboxElement) {
            return false;
        }

        const selectionCheckbox = !usesCheckboxRenderer
            ? cellElement.querySelector<HTMLInputElement>('.ag-selection-checkbox input[type="checkbox"]')
            : null;
        if (selectionCheckbox) {
            const isSelectable = row.selectable !== false;
            rowErrors.add(
                isSelectable &&
                    selectionCheckbox.disabled &&
                    `Row-selection checkbox in column id:"${columnId}" is disabled but row.selectable=true`
            );
            rowErrors.add(
                !isSelectable &&
                    !selectionCheckbox.disabled &&
                    `Row-selection checkbox in column id:"${columnId}" is not disabled but row.selectable=false`
            );
            if (isSelectable) {
                const isSelected = row.isSelected();
                const expectedChecked = isSelected === true;
                const expectedIndeterminate = isSelected === undefined;
                const actualIndeterminate = selectionCheckbox.indeterminate;
                const actualChecked = selectionCheckbox.checked;
                rowErrors.add(
                    expectedIndeterminate &&
                        !actualIndeterminate &&
                        `Row-selection checkbox in column id:"${columnId}" should be indeterminate (row.isSelected()=undefined) but is not`
                );
                rowErrors.add(
                    !expectedIndeterminate &&
                        actualIndeterminate &&
                        `Row-selection checkbox in column id:"${columnId}" should not be indeterminate (row.isSelected()=${isSelected})`
                );
                if (!expectedIndeterminate && !actualIndeterminate) {
                    rowErrors.add(
                        actualChecked !== expectedChecked &&
                            `Row-selection checkbox in column id:"${columnId}" expected checked=${expectedChecked} (row.isSelected()=${isSelected}) but input.checked=${actualChecked}`
                    );
                }
            }
            return false;
        }

        const cellValue = this.api.getCellValue({ rowNode: row, colKey: column });

        if (!checkboxElement) {
            return true;
        }

        // Native input owns state on .checked/.indeterminate; custom renderers may use aria-checked.
        const nativeInput = checkboxElement.matches('input[type="checkbox"]')
            ? (checkboxElement as HTMLInputElement)
            : checkboxElement.querySelector<HTMLInputElement>('input[type="checkbox"]');

        if (nativeInput) {
            // Aggregate rows (e.g. "3/5 Qualified") put non-boolean values → renderer shows indeterminate.
            if (typeof cellValue !== 'boolean' && cellValue != null) {
                return true;
            }
            const isIndeterminate = nativeInput.indeterminate;
            const isChecked = nativeInput.checked;
            const expectedChecked = cellValue === true;
            const expectedIndeterminate = cellValue == null;

            rowErrors.add(
                !isIndeterminate &&
                    expectedIndeterminate &&
                    `HTML checkbox state mismatch for column id:"${columnId}", expected indeterminate (value=${cellValue}) but input is not indeterminate`
            );
            rowErrors.add(
                isIndeterminate &&
                    !expectedIndeterminate &&
                    `HTML checkbox state mismatch for column id:"${columnId}", expected checked=${expectedChecked} (value=${cellValue}) but input is indeterminate`
            );
            if (!isIndeterminate && !expectedIndeterminate) {
                rowErrors.add(
                    isChecked !== expectedChecked &&
                        `HTML checkbox state mismatch for column id:"${columnId}", expected checked=${expectedChecked} (value=${cellValue}) but input.checked=${isChecked}`
                );
            }
            return true;
        }

        // Fallback for custom renderers using aria-checked.
        const expectedAria =
            cellValue === true ? 'true' : cellValue === false ? 'false' : cellValue == null ? 'mixed' : null;

        if (expectedAria === null) {
            return true;
        }

        const ariaSource = checkboxElement.hasAttribute('aria-checked')
            ? checkboxElement
            : checkboxElement.querySelector('[aria-checked]');
        const ariaChecked = ariaSource?.getAttribute('aria-checked') ?? '';
        rowErrors.add(
            ariaChecked !== expectedAria &&
                `HTML checkbox state mismatch for column id:"${columnId}", expected aria-checked=${expectedAria}, got ${ariaChecked}`
        );

        return true;
    }

    private lookupAutoGroupColumn(): Column | undefined {
        return (
            this.api.getColumn(AUTO_GROUP_COL_ID) ||
            this.api.getAllGridColumns()?.find((col) => isAutoGroupColumn(col.getColId()))
        );
    }
}

/** Acceptable string forms an editor `<input>` may use for `editValue` (Date supports several). */
function editValueAlternatives(editValue: unknown): string[] {
    if (editValue == null) {
        return [''];
    }
    if (editValue instanceof Date) {
        const iso = editValue.toISOString();
        const mm = String(editValue.getMonth() + 1).padStart(2, '0');
        const dd = String(editValue.getDate()).padStart(2, '0');
        const localDate = `${editValue.getFullYear()}-${mm}-${dd}`;
        return [String(editValue), iso, iso.slice(0, 10), localDate];
    }
    return [String(editValue)];
}

/** First ancestor whose `rowGroupColumn.colId === colId` — owner of the displayed `allChildrenCount`. */
function findAncestorForGroupKey(row: RowNode<any>, colId: string): RowNode<any> | undefined {
    let cursor: RowNode<any> | null | undefined = row.parent as RowNode<any> | null;
    while (cursor) {
        if (cursor.group && cursor.rowGroupColumn?.getColId() === colId) {
            return cursor;
        }
        cursor = cursor.parent as RowNode<any> | null;
    }
    return undefined;
}

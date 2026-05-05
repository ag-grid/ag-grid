import type { Column, GridApi, RowNode } from 'ag-grid-community';

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
    private readonly isGroupRowsDisplay: boolean;
    private readonly autoGroupColumn?: Column;

    public constructor(private readonly gridRows: GridRows) {
        const api = gridRows.api;
        this.api = api;
        this.columns = api.getAllGridColumns() ?? [];
        this.isGroupRowsDisplay = api.getGridOption('groupDisplayType') === 'groupRows';
        this.autoGroupColumn = this.lookupAutoGroupColumn();
    }

    public validateRow(row: RowNode<any>, rowElements: HTMLElement[]): void {
        const rowErrors = this.gridRows.errors.get(row);

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
        rowErrors: GridRowErrors<any>
    ): void {
        const columnId = column.getColId();
        const cellElement = findCellElement(rowElements, columnId);

        rowErrors.add(
            !cellElement &&
                this.shouldReportMissingCell(row, column) &&
                `Missing cell element for column id:"${columnId}"`
        );
        if (!cellElement) {
            return;
        }

        // If a custom domCellValidator callback is provided and returns false, skip default validation for this cell
        if (this.gridRows.options.domCellValidator?.({ row, column, cellElement, rowErrors }) === false) {
            return;
        }

        // Validate edit-related CSS classes on the cell when checkEditState is enabled
        if (this.gridRows.checkEditState) {
            const cellHasActiveEditor = this.gridRows.isCellActivelyEditing(row, columnId);

            // ag-cell-inline-editing is set for in-cell editors; ag-cell-popup-editing for popup editors.
            // Both mean the cell has an active editor — the distinction is where the editor DOM is rendered.
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

            // ag-cell-editing and ag-cell-batch-edit are set by CellEditStyleFeature (batch mode only).
            // On group/footer rows these classes can be inherited from leaf children via _hasLeafEdits,
            // which is too complex to validate here, so we only check leaf rows.
            if (this.gridRows.checkBatchState && !row.group && !row.footer) {
                const hasCellEditingClass = cellElement.classList.contains('ag-cell-editing');
                const hasBatchEditClass = cellElement.classList.contains('ag-cell-batch-edit');

                // ag-cell-editing is applied when pendingValue differs from sourceValue, not when
                // a cell merely has an active editor. Compare batch vs data values to determine expected state.
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
                const cellHasBatchChange = batchValue !== dataValue;

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

            // Validate editor input value for cells with active editors
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

        const cellValue = this.api.getCellValue({ rowNode: row, colKey: column, useFormatter: true });
        const stringCellValue = cellValue != null ? String(cellValue).trim() : '';
        const colDef = column.getColDef();
        const cellRenderer = colDef?.cellRenderer;
        const isGroupCol = (!cellRenderer && isAutoGroupColumn(columnId)) || cellRenderer === 'agGroupCellRenderer';

        if (isGroupCol) {
            const childCountText = this.getChildCountText(row, this.isGroupCountSuppressed(column, true));
            if (textContent === childCountText || (cellValue === null && textContent === '')) {
                return;
            }
            const expected = combineGroupValue(stringCellValue, childCountText);
            this.reportGroupCellMismatch(rowErrors, columnId, expected, textContent);
            return;
        }

        const hasGroupRendererDom = !!cellElement.querySelector('.ag-group-value');
        const showRowGroup = colDef.showRowGroup;
        // Unresolved `showRowGroup: '<colId>'` on a group row leaves `groupData` empty and the
        // grid renders the cell as a regular cell. Skip the group-cell path in that case.
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

        rowErrors.add(textContent !== stringCellValue && cellValueMismatchMsg(columnId, cellValue, textContent));
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
        if (!column.isVisible() || row.master) {
            return false;
        }

        const columnId = column.getColId();
        if (columnId === 'ag-Grid-SelectionColumn') {
            return false;
        }

        return !column.getId().startsWith('pivot_');
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
            return combineGroupValue(valueText, childCountText);
        }
        return childCountText;
    }

    private getExpectedGroupTextFromColumn(row: RowNode<any>, column: Column<any>): string {
        const cellValue = this.api.getCellValue({ rowNode: row, colKey: column, useFormatter: true });
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
            // Popup or custom editor — input is outside the cell element, cannot validate input value
            return;
        }
        const editValue = this.api.getCellValue({ rowNode: row, colKey: column, useFormatter: false, from: 'edit' });
        const expectedStr = editValue != null ? String(editValue) : '';
        const actualStr = input.value ?? '';

        // getCellValue(from:'edit') returns the last synced edit value — not the live keystroke state.
        // editorValue is only updated when stopEditing() is called or setDataValue() is invoked.
        // When an editor is started via Backspace (input cleared, no sync yet), actualStr is ""
        // but expectedStr is the original committed value. This mismatch is expected and not an error.
        if (actualStr === '' && expectedStr !== '') {
            return;
        }

        const columnId = column.getColId();
        rowErrors.add(
            actualStr !== expectedStr &&
                `Editor input value mismatch for column id:"${columnId}", expected ${JSON.stringify(expectedStr)}, got ${JSON.stringify(actualStr)}`
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

        const cellValue = this.api.getCellValue({ rowNode: row, colKey: column });

        if (!checkboxElement) {
            return true;
        }

        // The grid's agCheckboxCellRenderer uses a native input[type=checkbox] element.
        // Its state is stored in the input's .checked and .indeterminate properties, not aria-checked.
        // Some custom checkbox implementations may use aria-checked instead.
        const nativeInput = checkboxElement.matches('input[type="checkbox"]')
            ? (checkboxElement as HTMLInputElement)
            : checkboxElement.querySelector<HTMLInputElement>('input[type="checkbox"]');

        if (nativeInput) {
            // Validate via native checkbox properties: checked=true/false, indeterminate=true for null/undefined
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

        // Fallback: validate via aria-checked attribute (for custom checkbox implementations)
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

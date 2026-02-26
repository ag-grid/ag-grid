import type { IRowNode, RowNode } from 'ag-grid-community';

import { getGridHTMLElement, getRowHtmlElements } from '../gridHtmlRows';
import type { GridRows } from '../gridRows';
import type { GridRowsDomRowValidatorParams } from '../gridRowsOptions';
import { gridRowsBugs } from '../rows-validation/bugs';
import type { GridRowsBugs } from '../rows-validation/bugs';
import type { GridRowsErrors } from '../rows-validation/gridRowsErrors';
import {
    assertDomOrder,
    countHeaderRows,
    ensureDomRowsBelongToGrid,
    getDomRowIds,
    validateNoDuplicateRowIds,
} from './dom-validation-helpers';
import { GridRowDomCellValidator } from './gridRowDomCellValidator';
import { validateRowAriaAttributes } from './rowAriaValidation';
import { validateRowClasses } from './rowClassValidation';
import { validateRowSelectionState } from './rowSelectionValidation';

export class GridRowsDomValidator {
    public validatedRows = new Set<IRowNode>();
    public bugs: Readonly<GridRowsBugs>;

    public constructor(public readonly errors: GridRowsErrors) {
        this.bugs = gridRowsBugs;
    }

    public validate(gridRows: GridRows) {
        this.bugs = gridRows.bugs;

        const gridElement = getGridHTMLElement(gridRows.api);
        gridRows.errors.default.add(!gridElement && 'Grid HTMLElement not found');
        if (!gridElement) {
            return;
        }

        const cellValidator = new GridRowDomCellValidator(gridRows);
        const domRowIds = getDomRowIds(gridRows);
        let domRowIdx = 0;
        const displayedRows = gridRows.displayedRows;
        const lastDisplayedRowIndex = displayedRows.length - 1;
        const { bugs } = this;
        const headerRowCount = countHeaderRows(gridElement);
        const { domRowValidator } = gridRows.options;

        // Validate pinned top rows
        const lastPinnedTopIndex = gridRows.pinnedTopRows.length - 1;
        for (const row of gridRows.pinnedTopRows) {
            this.validateRowCommon(
                gridRows,
                row,
                cellValidator,
                lastPinnedTopIndex,
                bugs,
                headerRowCount,
                domRowValidator
            );
        }

        for (const row of displayedRows) {
            if (gridRows.isDuplicateIdRow(row) || this.validatedRows.has(row)) {
                continue;
            }

            const rowElements = this.resolveRowElements(gridRows, row);
            if (!rowElements) {
                continue;
            }

            if (!row.sticky && !row.detail) {
                domRowIdx = assertDomOrder(gridRows, row, domRowIds, String(row.id), domRowIdx);
            }

            if (
                this.runRowValidators(
                    gridRows,
                    row,
                    rowElements,
                    cellValidator,
                    lastDisplayedRowIndex,
                    bugs,
                    headerRowCount,
                    domRowValidator
                )
            ) {
                const detailGridRows = gridRows.getDetailGridRows(row);
                if (detailGridRows) {
                    this.validate(detailGridRows);
                }
            }
        }

        // Validate pinned bottom rows
        const lastPinnedBottomIndex = gridRows.pinnedBottomRows.length - 1;
        for (const row of gridRows.pinnedBottomRows) {
            this.validateRowCommon(
                gridRows,
                row,
                cellValidator,
                lastPinnedBottomIndex,
                bugs,
                headerRowCount,
                domRowValidator
            );
        }

        ensureDomRowsBelongToGrid(gridRows);
        validateNoDuplicateRowIds(gridRows);
    }

    /** Validates a pinned row (top or bottom). */
    private validateRowCommon(
        gridRows: GridRows,
        row: RowNode,
        cellValidator: GridRowDomCellValidator,
        lastDisplayedRowIndex: number,
        bugs: Readonly<GridRowsBugs>,
        headerRowCount: number,
        domRowValidator: ((params: GridRowsDomRowValidatorParams) => boolean | void) | undefined
    ): void {
        const rowElements = this.resolveRowElements(gridRows, row);
        if (!rowElements) {
            return;
        }
        this.runRowValidators(
            gridRows,
            row,
            rowElements,
            cellValidator,
            lastDisplayedRowIndex,
            bugs,
            headerRowCount,
            domRowValidator
        );
    }

    /** Marks a row as validated, gets its DOM elements, and reports missing elements. Returns null if row was already validated or has no elements. */
    private resolveRowElements(gridRows: GridRows, row: RowNode): HTMLElement[] | null {
        if (this.validatedRows.has(row)) {
            return null;
        }
        this.validatedRows.add(row);
        const stringId = String(row.id);
        const rowElements = getRowHtmlElements(gridRows.api, stringId);
        this.errors.add(
            row,
            !rowElements.length &&
                row.id !== undefined &&
                'Row HTMLElement row-id=' + JSON.stringify(stringId) + ' not found'
        );
        return rowElements.length ? rowElements : null;
    }

    /** Runs all validation checks on a row's DOM elements. Returns true if validation was not skipped by domRowValidator. */
    private runRowValidators(
        gridRows: GridRows,
        row: RowNode,
        rowElements: HTMLElement[],
        cellValidator: GridRowDomCellValidator,
        lastDisplayedRowIndex: number,
        bugs: Readonly<GridRowsBugs>,
        headerRowCount: number,
        domRowValidator: ((params: GridRowsDomRowValidatorParams) => boolean | void) | undefined
    ): boolean {
        const rowErrors = this.errors.get(row);
        if (domRowValidator?.({ row, rowElements, rowErrors }) === false) {
            return false;
        }
        validateRowClasses(row, rowElements, rowErrors, lastDisplayedRowIndex, bugs, gridRows);
        validateRowAriaAttributes(row, rowElements, rowErrors, bugs, headerRowCount);
        validateRowSelectionState(row, rowElements, rowErrors);
        cellValidator.validateRow(row, rowElements);
        return true;
    }
}

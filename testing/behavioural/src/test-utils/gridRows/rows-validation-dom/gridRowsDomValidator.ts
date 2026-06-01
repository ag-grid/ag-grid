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

    public validate(gridRows: GridRows): void {
        this.bugs = gridRows.bugs;

        const gridElement = getGridHTMLElement(gridRows.api);
        // When the grid api has been destroyed there is nothing left to DOM-validate; skip
        // silently so tests can still snapshot the empty post-destroy state.
        const apiDestroyed = gridRows.api.isDestroyed?.() === true;
        gridRows.errors.default.add(!gridElement && !apiDestroyed && 'Grid HTMLElement not found');
        if (!gridElement) {
            return;
        }

        // SSRM lazy-loads; CSRM virtualises unless explicitly suppressed. When viewport is mocked to
        // 0, the grid renders all displayed rows anyway, so "suppress missing-row error" stays safe.
        const ssrm = gridRows.api.getGridOption?.('rowModelType') === 'serverSide';
        const rowVirtualisationActive = ssrm || gridRows.api.getGridOption?.('suppressRowVirtualisation') !== true;

        const cellValidator = new GridRowDomCellValidator(gridRows);
        const domRowIds = getDomRowIds(gridRows);
        let domRowIdx = 0;
        const displayedRows = paginatedSlice(gridRows);
        // For paginated grids, the first/last rowIndex of the rendered slice may not be 0 / length-1
        // — pagination keeps absolute rowIndex values across all pages. Use the slice endpoints'
        // actual rowIndex so `ag-row-first` / `ag-row-last` class checks match the rendered subset.
        const firstDisplayedRowIndex = displayedRows[0]?.rowIndex ?? 0;
        const lastDisplayedRowIndex = displayedRows[displayedRows.length - 1]?.rowIndex ?? displayedRows.length - 1;
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

            const rowElements = this.resolveRowElements(gridRows, row, rowVirtualisationActive);
            if (!rowElements) {
                continue;
            }

            if (!row.sticky && !row.detail) {
                domRowIdx = assertDomOrder(gridRows, row, domRowIds, String(row.id), domRowIdx);
            }

            // When row virtualisation is active, position-based first/last checks aren't meaningful.
            const effectiveFirst = rowVirtualisationActive ? -1 : firstDisplayedRowIndex;
            const effectiveLast = rowVirtualisationActive ? -1 : lastDisplayedRowIndex;

            if (
                this.runRowValidators(
                    gridRows,
                    row,
                    rowElements,
                    cellValidator,
                    effectiveLast,
                    bugs,
                    headerRowCount,
                    domRowValidator,
                    effectiveFirst
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

    /** Marks a row as validated, gets its DOM elements, and reports missing elements. Returns null if row was already validated or has no elements.
     *  When `allowMissing` is true (SSRM virtualisation), missing DOM elements are silently
     *  treated as "not rendered yet" instead of erroring. */
    private resolveRowElements(gridRows: GridRows, row: RowNode, allowMissing = false): HTMLElement[] | null {
        if (this.validatedRows.has(row)) {
            return null;
        }
        this.validatedRows.add(row);
        const stringId = String(row.id);
        const rowElements = getRowHtmlElements(gridRows.api, stringId);
        if (!allowMissing) {
            this.errors.add(
                row,
                !rowElements.length &&
                    row.id !== undefined &&
                    'Row HTMLElement row-id=' + JSON.stringify(stringId) + ' not found'
            );
        }
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
        domRowValidator: ((params: GridRowsDomRowValidatorParams) => boolean | void) | undefined,
        firstDisplayedRowIndex: number = 0
    ): boolean {
        const rowErrors = this.errors.get(row);
        if (domRowValidator?.({ row, rowElements, rowErrors }) === false) {
            return false;
        }
        validateRowClasses(row, rowElements, rowErrors, lastDisplayedRowIndex, bugs, gridRows, firstDisplayedRowIndex);
        validateRowAriaAttributes(
            row,
            rowElements,
            rowErrors,
            bugs,
            headerRowCount,
            gridRows.pinnedTopRows.length,
            gridRows.displayedRows.length
        );
        validateRowSelectionState(row, rowElements, rowErrors);
        cellValidator.validateRow(row, rowElements);
        return true;
    }
}

/** When pagination is active, the DOM only contains the rows belonging to the current page —
 *  rows from other pages exist in the row model but aren't rendered. This helper returns the
 *  subset of `displayedRows` that's actually rendered, so DOM checks don't flag absent rows.
 *  Uses the grid's actual first/last displayed row indices (which respect both pagination and
 *  `paginateChildRows`) rather than naive `pageSize * currentPage` arithmetic — the latter is
 *  incorrect when `paginateChildRows: false` because expanded children inflate the page span
 *  beyond `pageSize`. */
function paginatedSlice(gridRows: GridRows): RowNode[] {
    const api = gridRows.api;
    if (!(api.isModuleRegistered as (name: string) => boolean)('Pagination')) {
        return gridRows.displayedRows;
    }
    const pagination = api.getGridOption?.('pagination');
    if (!pagination) {
        return gridRows.displayedRows;
    }
    const first = api.getFirstDisplayedRowIndex?.();
    const last = api.getLastDisplayedRowIndex?.();
    if (typeof first !== 'number' || typeof last !== 'number' || first < 0 || last < first) {
        return gridRows.displayedRows;
    }
    return gridRows.displayedRows.slice(first, last + 1);
}

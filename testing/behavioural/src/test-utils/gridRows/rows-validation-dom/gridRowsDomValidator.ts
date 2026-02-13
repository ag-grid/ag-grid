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

        const api = gridRows.api;
        const cellValidator = new GridRowDomCellValidator(gridRows);
        const domRowIds = getDomRowIds(gridRows);
        let domRowIdx = 0;
        const displayedRows = gridRows.displayedRows;
        const lastDisplayedRowIndex = displayedRows.length - 1;
        const { bugs } = this;
        const headerRowCount = countHeaderRows(gridElement);
        const { domRowValidator } = gridRows.options;

        // Validate pinned top rows
        const pinnedTopRows = gridRows.pinnedTopRows;
        const lastPinnedTopIndex = pinnedTopRows.length - 1;
        for (const row of pinnedTopRows) {
            this.validateRow(gridRows, row, cellValidator, lastPinnedTopIndex, bugs, headerRowCount, domRowValidator);
        }

        for (const row of displayedRows) {
            if (gridRows.isDuplicateIdRow(row) || this.validatedRows.has(row)) {
                continue;
            }

            this.validatedRows.add(row);
            const stringId = String(row.id);
            const rowElements = getRowHtmlElements(api, stringId);

            this.errors.add(
                row,
                !rowElements.length &&
                    row.id !== undefined &&
                    'Row HTMLElement row-id=' + JSON.stringify(stringId) + ' not found'
            );
            if (!rowElements.length) {
                continue;
            }

            if (!row.sticky && !row.detail) {
                domRowIdx = assertDomOrder(gridRows, row, domRowIds, stringId, domRowIdx);
            }

            const rowErrors = this.errors.get(row);

            if (domRowValidator?.({ row, rowElements, rowErrors }) === false) {
                continue;
            }

            validateRowClasses(row, rowElements, rowErrors, lastDisplayedRowIndex, bugs);
            validateRowAriaAttributes(row, rowElements, rowErrors, bugs, headerRowCount);
            validateRowSelectionState(row, rowElements, rowErrors);
            cellValidator.validateRow(row, rowElements);

            const detailGridRows = gridRows.getDetailGridRows(row);
            if (detailGridRows) {
                this.validate(detailGridRows);
            }
        }

        // Validate pinned bottom rows
        const pinnedBottomRows = gridRows.pinnedBottomRows;
        const lastPinnedBottomIndex = pinnedBottomRows.length - 1;
        for (const row of pinnedBottomRows) {
            this.validateRow(
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

    private validateRow(
        gridRows: GridRows,
        row: RowNode,
        cellValidator: GridRowDomCellValidator,
        lastDisplayedRowIndex: number,
        bugs: Readonly<GridRowsBugs>,
        headerRowCount: number,
        domRowValidator: ((params: GridRowsDomRowValidatorParams) => boolean | void) | undefined
    ): void {
        if (this.validatedRows.has(row)) {
            return;
        }
        this.validatedRows.add(row);
        const api = gridRows.api;
        const stringId = String(row.id);
        const rowElements = getRowHtmlElements(api, stringId);
        this.errors.add(
            row,
            !rowElements.length &&
                row.id !== undefined &&
                'Row HTMLElement row-id=' + JSON.stringify(stringId) + ' not found'
        );
        if (!rowElements.length) {
            return;
        }
        const rowErrors = this.errors.get(row);
        if (domRowValidator?.({ row, rowElements, rowErrors }) === false) {
            return;
        }
        validateRowClasses(row, rowElements, rowErrors, lastDisplayedRowIndex, bugs);
        validateRowAriaAttributes(row, rowElements, rowErrors, bugs, headerRowCount);
        validateRowSelectionState(row, rowElements, rowErrors);
        cellValidator.validateRow(row, rowElements);
    }
}

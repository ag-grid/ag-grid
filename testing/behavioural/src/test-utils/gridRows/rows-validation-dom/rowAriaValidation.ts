import type { RowNode } from 'ag-grid-community';

import type { GridRowsBugs } from '../rows-validation/bugs';
import type { GridRowErrors } from '../rows-validation/gridRowErrors';

/** Validates ARIA attributes on row DOM elements against the grid model. */
export function validateRowAriaAttributes(
    row: RowNode<any>,
    rowElements: HTMLElement[],
    rowErrors: GridRowErrors<any>,
    bugs: Readonly<GridRowsBugs>,
    headerRowCount: number,
    pinnedTopRowCount: number,
    displayedRowCount: number
): void {
    const el = rowElements[0];
    if (!el) {
        return;
    }

    // aria-expanded: should be present on expandable rows, absent on non-expandable rows
    if (bugs.ariaExpanded) {
        const expandable = row.isExpandable();
        const ariaExpanded = el.getAttribute('aria-expanded');
        const expectedExpanded = row.expanded ? 'true' : 'false';
        rowErrors.add(
            !expandable && ariaExpanded !== null && 'Non-expandable row should NOT have aria-expanded attribute'
        );
        rowErrors.add(
            !!expandable &&
                ariaExpanded !== null &&
                ariaExpanded !== expectedExpanded &&
                `aria-expanded should be ${expectedExpanded} but got ${JSON.stringify(ariaExpanded)}`
        );
    }

    // row-index attribute
    if (row.rowIndex != null) {
        const rowIndexAttr = el.getAttribute('row-index');
        const expectedRowIndex = rowIndexAttr !== null ? row.getRowIndexString?.() : undefined;
        rowErrors.add(
            expectedRowIndex != null &&
                rowIndexAttr !== expectedRowIndex &&
                `row-index attribute should be ${JSON.stringify(expectedRowIndex)} but got ${JSON.stringify(rowIndexAttr)}`
        );
    }

    // aria-rowindex: 1-based absolute row index across pinned top, body and pinned bottom lanes.
    if (row.rowIndex != null && headerRowCount >= 0) {
        const ariaRowIndex = el.getAttribute('aria-rowindex');
        if (ariaRowIndex !== null) {
            const absoluteRowIndex =
                row.rowPinned === 'top'
                    ? row.rowIndex
                    : row.rowPinned === 'bottom'
                      ? pinnedTopRowCount + displayedRowCount + row.rowIndex
                      : pinnedTopRowCount + row.rowIndex;
            const expectedAriaRowIndex = String(headerRowCount + absoluteRowIndex + 1);
            rowErrors.add(
                ariaRowIndex !== expectedAriaRowIndex &&
                    `aria-rowindex should be ${expectedAriaRowIndex} but got ${JSON.stringify(ariaRowIndex)}`
            );
        }
    }
}

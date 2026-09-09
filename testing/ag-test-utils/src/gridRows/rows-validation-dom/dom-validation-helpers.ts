import type { RowNode } from 'ag-grid-community';

import { getGridHTMLElement, getGridRowsHtmlElements } from '../gridHtmlRows';
import type { GridRows } from '../gridRows';
import { getRowContainerType, isInNestedGrid } from './containers-helpers';

/** Collects DOM row-ids in order for DOM-order validation. Returns null if order check is not needed. */
export function getDomRowIds(gridRows: GridRows): string[] | null {
    // Duplicate ids make a position-by-position comparison meaningless, and that is the only case worth
    // skipping - `ensureDomOrder` is precisely when the comparison is worth making.
    if (gridRows.displayedRows.some((row) => gridRows.isDuplicateIdRow(row))) {
        return null;
    }

    // Mirrors the ordered walk in gridRowsDomValidator, which asserts order for the scrolling container
    // only: pinned rows are validated separately and sticky, detail and nested-grid rows are skipped there.
    // Any element included here that the walk does not assert shifts every index after it.
    const gridElement = getGridHTMLElement(gridRows.api);
    const ids: string[] = [];
    for (const element of getGridRowsHtmlElements(gridRows.api)) {
        if (getRowContainerType(element) !== 'center' || (gridElement && isInNestedGrid(element, gridElement))) {
            continue;
        }
        // A row-span anchor renders a second element in this lane for the merged cells, sharing its row-id.
        if (element.classList.contains('ag-spanned-row')) {
            continue;
        }
        const id = element.getAttribute('row-id') ?? '';
        const row = gridRows.getById(id);
        // An id the model does not know belongs to `ensureDomRowsBelongToGrid`, not to an order comparison:
        // counting it here would shift every index after it and report the wrong row as misplaced.
        if (!row || row.sticky || row.detail) {
            continue;
        }
        ids.push(id);
    }
    return ids;
}

/** Asserts that a row appears at the expected position in the DOM order. Returns the next expected index. */
export function assertDomOrder(
    gridRows: GridRows,
    row: RowNode<any>,
    domRowIds: string[] | null,
    rowId: string,
    domIndex: number
): number {
    if (!domRowIds || domIndex >= domRowIds.length) {
        return domIndex;
    }

    gridRows.errors
        .get(row)
        .add(
            domRowIds[domIndex] !== rowId &&
                'HTMLElement row.id=' +
                    JSON.stringify(domRowIds[domIndex]) +
                    ' found instead, for row index ' +
                    domIndex
        );
    return domIndex + 1;
}

/**
 * Ensures all row elements in the DOM belong to displayed rows. Reads `id`, which a row element does not
 * carry, so this currently matches nothing: switching it to `row-id` reports a stale detail-grid row that
 * survives a rowData replacement, and an SSRM group id that does not compare equal. Both want their own fix.
 */
export function ensureDomRowsBelongToGrid(gridRows: GridRows): void {
    for (const element of getGridRowsHtmlElements(gridRows.api)) {
        const id = element.getAttribute('id');
        gridRows.errors.default.add(
            id !== null &&
                !gridRows.isRowDisplayed(gridRows.getById(id)) &&
                'HTML row ' + JSON.stringify(id) + ' exists, but no displayed row with that id exists'
        );
    }
}

/** Validates that no two row elements share the same row-id within the same container. */
export function validateNoDuplicateRowIds(gridRows: GridRows): void {
    const gridElement = getGridHTMLElement(gridRows.api);
    if (!gridElement) {
        return;
    }

    // Only consider direct row elements — exclude rows belonging to nested detail grids.
    const allRowElements = getGridRowsHtmlElements(gridRows.api);
    const rowElements = allRowElements.filter((el) => !isInNestedGrid(el, gridElement));
    const seenIds = new Map<string, HTMLElement[]>();
    for (const element of rowElements) {
        const rowId = element.getAttribute('row-id');
        // A row-span anchor legitimately has a second element in its container for the merged cells.
        if (rowId === null || element.classList.contains('ag-spanned-row')) {
            continue;
        }
        let arr = seenIds.get(rowId);
        if (!arr) {
            arr = [];
            seenIds.set(rowId, arr);
        }
        arr.push(element);
    }

    for (const [rowId, elements] of seenIds) {
        if (elements.length <= 1) {
            continue;
        }

        // Multiple elements with same row-id is normal for pinned left/right/center containers.
        // But the same container should not have duplicate row-id elements.
        const containerSet = new Set<string>();
        for (const el of elements) {
            const container = getRowContainerType(el);
            if (!containerSet.has(container)) {
                containerSet.add(container);
                continue;
            }
            gridRows.errors.default.add(
                `Duplicate row-id ${JSON.stringify(rowId)} in DOM container ${JSON.stringify(container)}`
            );
            break;
        }
    }
}

/** Counts the rows above the data rows that occupy `aria-rowindex` slots. This includes
 *  `.ag-header-row` elements inside `.ag-header`, plus an extra slot for the advanced filter
 *  header row (`.ag-advanced-filter-header`) when present. */
export function countHeaderRows(gridElement: HTMLElement): number {
    const header = gridElement.querySelector('.ag-header');
    let count = 0;
    if (header) {
        count += header.querySelectorAll(':scope > .ag-header-row').length;
    }
    if (gridElement.querySelector('.ag-advanced-filter-header')) {
        count += 1;
    }
    return count;
}

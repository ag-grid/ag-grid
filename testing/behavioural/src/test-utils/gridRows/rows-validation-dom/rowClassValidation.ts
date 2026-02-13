import type { RowNode } from 'ag-grid-community';

import type { GridRowsBugs } from '../rows-validation/bugs';
import type { GridRowErrors } from '../rows-validation/gridRowErrors';

/** Validates CSS classes on row DOM elements against the grid model. */
export function validateRowClasses(
    row: RowNode<any>,
    rowElements: HTMLElement[],
    rowErrors: GridRowErrors<any>,
    lastDisplayedRowIndex: number,
    bugs: Readonly<GridRowsBugs>
): void {
    const el = rowElements[0];
    if (!el) {
        return;
    }

    const classList = el.classList;

    // ag-row-level-N
    const level = row.level ?? 0;
    const expectedLevelClass = `ag-row-level-${level}`;
    rowErrors.add(
        !classList.contains(expectedLevelClass) && `HTML element should have class ${expectedLevelClass} but does not`
    );

    // ag-row-footer
    rowErrors.add(
        !!row.footer && !classList.contains('ag-row-footer') && 'HTML element should have ag-row-footer class'
    );
    rowErrors.add(
        !row.footer && classList.contains('ag-row-footer') && 'HTML element should NOT have ag-row-footer class'
    );

    // ag-row-group is set for all expandable rows (groups, master, tree parents)
    const expandable = row.isExpandable();
    rowErrors.add(expandable && !classList.contains('ag-row-group') && 'Expandable row should have ag-row-group class');
    rowErrors.add(
        !expandable &&
            classList.contains('ag-row-group') &&
            !classList.contains('ag-full-width-row') &&
            'Non-expandable row should NOT have ag-row-group class'
    );

    // ag-row-pinned
    rowErrors.add(
        !!row.isRowPinned() && !classList.contains('ag-row-pinned') && 'Pinned row should have ag-row-pinned class'
    );
    rowErrors.add(
        !row.isRowPinned() &&
            classList.contains('ag-row-pinned') &&
            !row.pinnedSibling &&
            'Non-pinned row should NOT have ag-row-pinned class'
    );

    // ag-row-even / ag-row-odd / ag-row-first / ag-row-last
    const rowIndex = row.rowIndex;
    if (rowIndex != null && !row.rowPinned) {
        const isEven = rowIndex % 2 === 0;
        rowErrors.add(
            isEven && classList.contains('ag-row-odd') && `HTML element has ag-row-odd but rowIndex ${rowIndex} is even`
        );
        rowErrors.add(
            !isEven &&
                classList.contains('ag-row-even') &&
                `HTML element has ag-row-even but rowIndex ${rowIndex} is odd`
        );

        const isFirst = rowIndex === 0;
        rowErrors.add(
            isFirst && !classList.contains('ag-row-first') && 'First displayed row should have ag-row-first class'
        );
        rowErrors.add(
            !isFirst &&
                classList.contains('ag-row-first') &&
                'Non-first displayed row should NOT have ag-row-first class'
        );

        const isLast = rowIndex === lastDisplayedRowIndex;
        rowErrors.add(
            isLast && !classList.contains('ag-row-last') && 'Last displayed row should have ag-row-last class'
        );
        rowErrors.add(
            !isLast && classList.contains('ag-row-last') && 'Non-last displayed row should NOT have ag-row-last class'
        );
    }

    // ag-row-loading for stub rows
    rowErrors.add(!!row.stub && !classList.contains('ag-row-loading') && 'Stub row should have ag-row-loading class');
    rowErrors.add(
        !row.stub && classList.contains('ag-row-loading') && 'Non-stub row should NOT have ag-row-loading class'
    );

    // ag-row-group-expanded / ag-row-group-contracted (enterprise only — validate consistency when present)
    if (!bugs.expandedContractedClasses) {
        return;
    }

    const hasExpandedClass = classList.contains('ag-row-group-expanded');
    const hasContractedClass = classList.contains('ag-row-group-contracted');
    if (!hasExpandedClass && !hasContractedClass) {
        return;
    }

    const isExpanded = !!row.expanded;
    rowErrors.add(hasExpandedClass && !expandable && 'Non-expandable row should NOT have ag-row-group-expanded class');
    rowErrors.add(
        hasContractedClass && !expandable && 'Non-expandable row should NOT have ag-row-group-contracted class'
    );
    rowErrors.add(
        hasExpandedClass &&
            hasContractedClass &&
            'Row should NOT have both ag-row-group-expanded and ag-row-group-contracted classes'
    );
    rowErrors.add(
        expandable && isExpanded && hasContractedClass && 'Expanded row should NOT have ag-row-group-contracted class'
    );
    rowErrors.add(
        expandable && !isExpanded && hasExpandedClass && 'Contracted row should NOT have ag-row-group-expanded class'
    );
}

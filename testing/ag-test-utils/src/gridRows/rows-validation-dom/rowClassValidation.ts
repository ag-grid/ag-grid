import type { RowNode } from 'ag-grid-community';

import type { GridRows } from '../gridRows';
import type { GridRowsBugs } from '../rows-validation/bugs';
import type { GridRowErrors } from '../rows-validation/gridRowErrors';

/** Validates CSS classes on row DOM elements against the grid model. */
export function validateRowClasses(
    row: RowNode<any>,
    rowElements: HTMLElement[],
    rowErrors: GridRowErrors<any>,
    lastDisplayedRowIndex: number,
    bugs: Readonly<GridRowsBugs>,
    gridRows?: GridRows,
    firstDisplayedRowIndex: number = 0
): void {
    const el = rowElements[0];
    if (!el) {
        return;
    }

    const classList = el.classList;

    // ag-row-level-N — use the same calculation as the grid (calculateRowLevel in rowStyleService.ts)
    const level = row.group ? (row.level ?? 0) : row.parent ? row.parent.level + 1 : 0;
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
    // Pinned clones of group rows (e.g. manually pinned grouped rows) keep their `ag-row-group`
    // class even though the clone itself isn't expandable — the main-area twin owns expansion.
    const isPinnedGroupClone = !!row.rowPinned && (row.group || !!row.pinnedSibling?.group);
    rowErrors.add(
        !expandable &&
            classList.contains('ag-row-group') &&
            !classList.contains('ag-full-width-row') &&
            !isPinnedGroupClone &&
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

        // Negative sentinel = "skip first/last checks" (used for SSRM where row position can't be
        // derived from the in-memory row model alone).
        const skipPositionChecks = firstDisplayedRowIndex < 0 || lastDisplayedRowIndex < 0;
        const isFirst = !skipPositionChecks && rowIndex === firstDisplayedRowIndex;
        if (!skipPositionChecks) {
            rowErrors.add(
                isFirst && !classList.contains('ag-row-first') && 'First displayed row should have ag-row-first class'
            );
            rowErrors.add(
                !isFirst &&
                    classList.contains('ag-row-first') &&
                    'Non-first displayed row should NOT have ag-row-first class'
            );
        }

        const isLast = !skipPositionChecks && rowIndex === lastDisplayedRowIndex;
        if (!skipPositionChecks) {
            rowErrors.add(
                isLast && !classList.contains('ag-row-last') && 'Last displayed row should have ag-row-last class'
            );
            rowErrors.add(
                !isLast &&
                    classList.contains('ag-row-last') &&
                    'Non-last displayed row should NOT have ag-row-last class'
            );
        }
    }

    // ag-row-loading for stub rows
    rowErrors.add(!!row.stub && !classList.contains('ag-row-loading') && 'Stub row should have ag-row-loading class');
    rowErrors.add(
        !row.stub && classList.contains('ag-row-loading') && 'Non-stub row should NOT have ag-row-loading class'
    );

    // Edit state classes — only validate when the edit style feature is active
    // (RowEditStyleFeature sets ag-row-inline-editing / ag-row-not-inline-editing only when the edit module is loaded)
    if (gridRows?.checkEditState) {
        // Skip validation for pinned sibling rows when the bug flag is not resolved — the grid
        // does not clean up edit CSS classes on the pinned sibling when editing stops.
        const skipPinnedSiblingBug = !bugs.pinnedSiblingEditCssClass && !!row.pinnedSibling;

        const hasEditStyleClasses =
            classList.contains('ag-row-inline-editing') || classList.contains('ag-row-not-inline-editing');
        if (hasEditStyleClasses && !skipPinnedSiblingBug) {
            const isEditing = gridRows.isRowEditing(row);

            validateClassPresence(classList, 'ag-row-inline-editing', isEditing, rowErrors);
            validateClassPresence(classList, 'ag-row-not-inline-editing', !isEditing, rowErrors);

            const isFullRowEdit = gridRows.api.getGridOption('editType') === 'fullRow';
            if (isFullRowEdit) {
                validateClassPresence(classList, 'ag-row-editing', isEditing, rowErrors);
            }
        }
    }

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

/** Validates that a CSS class is present or absent as expected. */
function validateClassPresence(
    classList: DOMTokenList,
    className: string,
    shouldBePresent: boolean,
    rowErrors: GridRowErrors<any>
): void {
    const hasClass = classList.contains(className);
    rowErrors.add(shouldBePresent && !hasClass && `HTML element should have ${className} class but does not`);
    rowErrors.add(!shouldBePresent && hasClass && `HTML element should NOT have ${className} class`);
}

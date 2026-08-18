import type { RowNode } from 'ag-grid-community';

import type { GridRowErrors } from '../rows-validation/gridRowErrors';

/** Validates the selection state of row DOM elements against the grid model. */
export function validateRowSelectionState(
    row: RowNode<any>,
    rowElements: HTMLElement[],
    rowErrors: GridRowErrors<any>
): void {
    const rowElement = rowElements[0];
    if (!rowElement) {
        return;
    }

    const isSelected = !!row.isSelected();

    rowErrors.add(
        isSelected !== rowElement.classList.contains('ag-row-selected') &&
            `HTML element should ${isSelected ? 'have' : 'NOT have'} ag-row-selected class, but has ${rowElement.className}`
    );

    // aria-selected: when present, must match the row's selection state
    const ariaSelected = rowElement.getAttribute('aria-selected');
    if (ariaSelected !== null) {
        const expectedAriaSelected = isSelected ? 'true' : 'false';
        rowErrors.add(
            ariaSelected !== expectedAriaSelected &&
                `aria-selected should be ${expectedAriaSelected} but got ${JSON.stringify(ariaSelected)}`
        );
    }

    // role="row" should always be present on row elements
    const role = rowElement.getAttribute('role');
    rowErrors.add(role !== 'row' && `Row element should have role="row" but got role=${JSON.stringify(role)}`);
}

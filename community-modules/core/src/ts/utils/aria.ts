import { Column } from '../entities/column';

export type ColumnSortState = 'ascending' | 'descending' | 'none';

// ARIA HELPER FUNCTIONS
function setAriaAttribute(element: HTMLElement, attribute: string, value: number | boolean | string): void {
    element.setAttribute(ariaAttributeName(attribute), value.toString());
}

function removeAriaAttribute(element: HTMLElement, attribute: string): void {
    element.removeAttribute(ariaAttributeName(attribute));
}

function ariaAttributeName(attribute: string) {
    return `aria-${attribute}`;
}

export function setAriaRole(element: HTMLElement, role?: string | null) {
    if (role) {
        element.setAttribute('role', role);
    } else {
        element.removeAttribute('role');
    }
}

export function getAriaSortState(column: Column): ColumnSortState {
    let sort: ColumnSortState;

    if (column.isSortAscending()) {
        sort = 'ascending';
    } else if (column.isSortDescending()) {
        sort = 'descending';
    } else {
        sort = 'none';
    }

    return sort;
}

// ARIA ATTRIBUTE GETTERS
export function getAriaLevel(element: HTMLElement): number {
    return parseInt(element.getAttribute('aria-level')!, 10);
}

export function getAriaPosInSet(element: HTMLElement): number {
    return parseInt(element.getAttribute('aria-posinset')!, 10);
}

export function getAriaDescribedBy(element: HTMLElement): string {
    return element.getAttribute('aria-describedby') || '';
}

// ARIA ATTRIBUTE SETTERS
export function setAriaLabel(element: HTMLElement, label?: string | null): void {
    const key = 'label';
    if (label != null && label !== '') {
        setAriaAttribute(element, key, label);
    } else {
        removeAriaAttribute(element, key);
    }
}

export function setAriaLabelledBy(element: HTMLElement, labelledBy: string): void {
    const key = 'labelledby';
    if (labelledBy) {
        setAriaAttribute(element, key, labelledBy);
    } else {
        removeAriaAttribute(element, key);
    }
}

export function setAriaDescription(element: HTMLElement, description?: string) {
    const key = 'description';

    if (description) {
        setAriaAttribute(element, key, description);
    } else {
        removeAriaAttribute(element, key);
    }
}

export function setAriaDescribedBy(element: HTMLElement, describedby: string | undefined): void {
    const key = 'describedby';
    if (describedby) {
        setAriaAttribute(element, key, describedby);
    } else {
        removeAriaAttribute(element, key);
    }
}

export function setAriaLevel(element: HTMLElement, level: number): void {
    setAriaAttribute(element, 'level', level);
}

export function setAriaDisabled(element: HTMLElement, disabled: boolean): void {
    setAriaAttribute(element, 'disabled', disabled);
}

export function setAriaHidden(element: HTMLElement, hidden: boolean): void {
    if (hidden) {
        setAriaAttribute(element, 'hidden', true);
    } else {
        removeAriaAttribute(element, 'hidden');
    }
}

export function setAriaExpanded(element: HTMLElement, expanded: boolean): void {
    setAriaAttribute(element, 'expanded', expanded);
}

export function removeAriaExpanded(element: HTMLElement): void {
    removeAriaAttribute(element, 'expanded');
}

export function setAriaSetSize(element: HTMLElement, setsize: number): void {
    setAriaAttribute(element, 'setsize', setsize);
}

export function setAriaPosInSet(element: HTMLElement, position: number): void {
    setAriaAttribute(element, 'posinset', position);
}

export function setAriaMultiSelectable(element: HTMLElement, multiSelectable: boolean): void {
    setAriaAttribute(element, 'multiselectable', multiSelectable);
}

export function setAriaRowCount(element: HTMLElement, rowCount: number): void {
    setAriaAttribute(element, 'rowcount', rowCount);
}

export function setAriaRowIndex(element: HTMLElement, rowIndex: number): void {
    setAriaAttribute(element, 'rowindex', rowIndex);
}

export function setAriaColCount(element: HTMLElement, colCount: number): void {
    setAriaAttribute(element, 'colcount', colCount);
}

export function setAriaColIndex(element: HTMLElement, colIndex: number): void {
    setAriaAttribute(element, 'colindex', colIndex);
}

export function setAriaColSpan(element: HTMLElement, colSpan: number): void {
    setAriaAttribute(element, 'colspan', colSpan);
}

export function setAriaSort(element: HTMLElement, sort: ColumnSortState): void {
    setAriaAttribute(element, 'sort', sort);
}

export function removeAriaSort(element: HTMLElement): void {
    removeAriaAttribute(element, 'sort');
}

export function setAriaSelected(element: HTMLElement, selected: boolean | undefined): void {
    const attributeName = 'selected';

    if (selected) {
        setAriaAttribute(element, attributeName, selected);
    } else {
        removeAriaAttribute(element, attributeName);
    }
}

export function setAriaChecked(element: HTMLElement, checked?: boolean) {
    setAriaAttribute(element, 'checked', checked === undefined ? 'mixed' : checked);
}
import { SortDirection } from '../main';

export type ColumnSortState = 'ascending' | 'descending' | 'other' | 'none';

// ARIA HELPER FUNCTIONS
function toggleAriaAttribute(element: HTMLElement, attribute: string, value?: number | boolean | string | null) {
    if (value == null || value == '') {
        removeAriaAttribute(element, attribute);
    } else {
        setAriaAttribute(element, attribute, value);
    }
}

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

export function getAriaSortState(sortDirection: SortDirection | 'mixed'): ColumnSortState {
    let sort: ColumnSortState;

    if (sortDirection === 'asc') {
        sort = 'ascending';
    } else if (sortDirection === 'desc') {
        sort = 'descending';
    } else if (sortDirection === 'mixed') {
        sort = 'other';
    } else {
        sort = 'none'
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
    toggleAriaAttribute(element, 'label', label);
}

export function setAriaLabelledBy(element: HTMLElement, labelledBy: string): void {
    toggleAriaAttribute(element, 'labelledby', labelledBy);
}

export function setAriaDescription(element: HTMLElement, description?: string) {
    toggleAriaAttribute(element, 'description', description);
}

export function setAriaDescribedBy(element: HTMLElement, describedby?: string): void {
    toggleAriaAttribute(element, 'describedby', describedby);
}

export function setAriaLive(element: HTMLElement, live?: 'polite' | 'assertive' | 'off' | null) {
    toggleAriaAttribute(element, 'live', live);
}

export function setAriaLevel(element: HTMLElement, level: number): void {
    toggleAriaAttribute(element, 'level', level);
}

export function setAriaDisabled(element: HTMLElement, disabled: boolean): void {
    toggleAriaAttribute(element, 'disabled', disabled);
}

export function setAriaHidden(element: HTMLElement, hidden: boolean): void {
    toggleAriaAttribute(element, 'hidden', hidden);
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

export function setAriaSelected(element: HTMLElement, selected?: boolean): void {
    toggleAriaAttribute(element, 'selected', selected);
}

export function setAriaChecked(element: HTMLElement, checked?: boolean) {
    setAriaAttribute(element, 'checked', checked === undefined ? 'mixed' : checked);
}
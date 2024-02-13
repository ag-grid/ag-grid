import { SortDirection } from '../entities/colDef';

export type ColumnSortState = 'ascending' | 'descending' | 'other' | 'none';

// ARIA HELPER FUNCTIONS
function toggleAriaAttribute(element: Element, attribute: string, value?: number | boolean | string | null) {
    if (value == null || (typeof value === 'string' && value == '')) {
        removeAriaAttribute(element, attribute);
    } else {
        setAriaAttribute(element, attribute, value);
    }
}

function setAriaAttribute(element: Element, attribute: string, value: number | boolean | string): void {
    element.setAttribute(ariaAttributeName(attribute), value.toString());
}

function removeAriaAttribute(element: Element, attribute: string): void {
    element.removeAttribute(ariaAttributeName(attribute));
}

function ariaAttributeName(attribute: string) {
    return `aria-${attribute}`;
}

export function setAriaRole(element: Element, role?: string | null) {
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
        sort = 'none';
    }

    return sort;
}

// ARIA ATTRIBUTE GETTERS
export function getAriaLevel(element: Element): number {
    return parseInt(element.getAttribute('aria-level')!, 10);
}

export function getAriaPosInSet(element: Element): number {
    return parseInt(element.getAttribute('aria-posinset')!, 10);
}

export function getAriaLabel(element: Element): string | null {
    return element.getAttribute('aria-label');
}

// ARIA ATTRIBUTE SETTERS
export function setAriaLabel(element: Element, label?: string | null): void {
    toggleAriaAttribute(element, 'label', label);
}

export function setAriaLabelledBy(element: Element, labelledBy: string): void {
    toggleAriaAttribute(element, 'labelledby', labelledBy);
}

export function setAriaDescribedBy(element: Element, describedby?: string): void {
    toggleAriaAttribute(element, 'describedby', describedby);
}

export function setAriaLive(element: Element, live?: 'polite' | 'assertive' | 'off' | null) {
    toggleAriaAttribute(element, 'live', live);
}

export function setAriaAtomic(element: Element, atomic: boolean | null) {
    toggleAriaAttribute(element, 'atomic', atomic);
}

export function setAriaRelevant(element: Element, relevant:  'additions' | 'additions text' | 'all' | 'removals' | 'text' | null) {
    toggleAriaAttribute(element, 'relevant', relevant);
}

export function setAriaLevel(element: Element, level: number): void {
    toggleAriaAttribute(element, 'level', level);
}

export function setAriaDisabled(element: Element, disabled: boolean): void {
    toggleAriaAttribute(element, 'disabled', disabled);
}

export function setAriaHidden(element: Element, hidden: boolean): void {
    toggleAriaAttribute(element, 'hidden', hidden);
}

export function setAriaActiveDescendant(element: Element, descendantId: string | null): void {
    toggleAriaAttribute(element, 'activedescendant', descendantId);
}

export function setAriaExpanded(element: Element, expanded: boolean): void {
    setAriaAttribute(element, 'expanded', expanded);
}

export function removeAriaExpanded(element: Element): void {
    removeAriaAttribute(element, 'expanded');
}

export function setAriaSetSize(element: Element, setsize: number): void {
    setAriaAttribute(element, 'setsize', setsize);
}

export function setAriaPosInSet(element: Element, position: number): void {
    setAriaAttribute(element, 'posinset', position);
}

export function setAriaMultiSelectable(element: Element, multiSelectable: boolean): void {
    setAriaAttribute(element, 'multiselectable', multiSelectable);
}

export function setAriaRowCount(element: Element, rowCount: number): void {
    setAriaAttribute(element, 'rowcount', rowCount);
}

export function setAriaRowIndex(element: Element, rowIndex: number): void {
    setAriaAttribute(element, 'rowindex', rowIndex);
}

export function setAriaColCount(element: Element, colCount: number): void {
    setAriaAttribute(element, 'colcount', colCount);
}

export function setAriaColIndex(element: Element, colIndex: number): void {
    setAriaAttribute(element, 'colindex', colIndex);
}

export function setAriaColSpan(element: Element, colSpan: number): void {
    setAriaAttribute(element, 'colspan', colSpan);
}

export function setAriaSort(element: Element, sort: ColumnSortState): void {
    setAriaAttribute(element, 'sort', sort);
}

export function removeAriaSort(element: Element): void {
    removeAriaAttribute(element, 'sort');
}

export function setAriaSelected(element: Element, selected?: boolean): void {
    toggleAriaAttribute(element, 'selected', selected);
}

export function setAriaChecked(element: Element, checked?: boolean) {
    setAriaAttribute(element, 'checked', checked === undefined ? 'mixed' : checked);
}

export function setAriaControls(controllerElement: Element, controlledElement: Element) {
    toggleAriaAttribute(controllerElement, 'controls', controlledElement.id);
    setAriaLabelledBy(controlledElement, controllerElement.id);
}


export function getAriaCheckboxStateName(translate: (key: string, defaultValue: string, variableValues?: string[]) => string, state?: boolean): string {
    return state === undefined
        ? translate('ariaIndeterminate', 'indeterminate')
        : (state === true
            ? translate('ariaChecked', 'checked')
            : translate('ariaUnchecked', 'unchecked')
        );
}

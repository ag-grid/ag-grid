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

export function _setAriaRole(element: Element, role?: string | null) {
    if (role) {
        element.setAttribute('role', role);
    } else {
        element.removeAttribute('role');
    }
}

export function _getAriaSortState(sortDirection: SortDirection | 'mixed'): ColumnSortState {
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
export function _getAriaLevel(element: Element): number {
    return parseInt(element.getAttribute('aria-level')!, 10);
}

export function _getAriaPosInSet(element: Element): number {
    return parseInt(element.getAttribute('aria-posinset')!, 10);
}

export function _getAriaLabel(element: Element): string | null {
    return element.getAttribute('aria-label');
}

// ARIA ATTRIBUTE SETTERS
export function _setAriaLabel(element: Element, label?: string | null): void {
    toggleAriaAttribute(element, 'label', label);
}

export function _setAriaLabelledBy(element: Element, labelledBy?: string): void {
    toggleAriaAttribute(element, 'labelledby', labelledBy);
}

export function _setAriaDescribedBy(element: Element, describedby?: string): void {
    toggleAriaAttribute(element, 'describedby', describedby);
}

export function _setAriaLive(element: Element, live?: 'polite' | 'assertive' | 'off' | null) {
    toggleAriaAttribute(element, 'live', live);
}

export function _setAriaAtomic(element: Element, atomic: boolean | null) {
    toggleAriaAttribute(element, 'atomic', atomic);
}

export function _setAriaRelevant(element: Element, relevant:  'additions' | 'additions text' | 'all' | 'removals' | 'text' | null) {
    toggleAriaAttribute(element, 'relevant', relevant);
}

export function _setAriaLevel(element: Element, level: number): void {
    toggleAriaAttribute(element, 'level', level);
}

export function _setAriaDisabled(element: Element, disabled: boolean): void {
    toggleAriaAttribute(element, 'disabled', disabled);
}

export function _setAriaHidden(element: Element, hidden: boolean): void {
    toggleAriaAttribute(element, 'hidden', hidden);
}

export function _setAriaActiveDescendant(element: Element, descendantId: string | null): void {
    toggleAriaAttribute(element, 'activedescendant', descendantId);
}

export function _setAriaExpanded(element: Element, expanded: boolean): void {
    setAriaAttribute(element, 'expanded', expanded);
}

export function _removeAriaExpanded(element: Element): void {
    removeAriaAttribute(element, 'expanded');
}

export function _setAriaSetSize(element: Element, setsize: number): void {
    setAriaAttribute(element, 'setsize', setsize);
}

export function _setAriaPosInSet(element: Element, position: number): void {
    setAriaAttribute(element, 'posinset', position);
}

export function _setAriaMultiSelectable(element: Element, multiSelectable: boolean): void {
    setAriaAttribute(element, 'multiselectable', multiSelectable);
}

export function _setAriaRowCount(element: Element, rowCount: number): void {
    setAriaAttribute(element, 'rowcount', rowCount);
}

export function _setAriaRowIndex(element: Element, rowIndex: number): void {
    setAriaAttribute(element, 'rowindex', rowIndex);
}

export function _setAriaColCount(element: Element, colCount: number): void {
    setAriaAttribute(element, 'colcount', colCount);
}

export function _setAriaColIndex(element: Element, colIndex: number): void {
    setAriaAttribute(element, 'colindex', colIndex);
}

export function _setAriaColSpan(element: Element, colSpan: number): void {
    setAriaAttribute(element, 'colspan', colSpan);
}

export function _setAriaSort(element: Element, sort: ColumnSortState): void {
    setAriaAttribute(element, 'sort', sort);
}

export function _removeAriaSort(element: Element): void {
    removeAriaAttribute(element, 'sort');
}

export function _setAriaSelected(element: Element, selected?: boolean): void {
    toggleAriaAttribute(element, 'selected', selected);
}

export function _setAriaChecked(element: Element, checked?: boolean) {
    setAriaAttribute(element, 'checked', checked === undefined ? 'mixed' : checked);
}

export function _setAriaControls(controllerElement: Element, controlledElement: Element) {
    toggleAriaAttribute(controllerElement, 'controls', controlledElement.id);
    _setAriaLabelledBy(controlledElement, controllerElement.id);
}


export function _getAriaCheckboxStateName(translate: (key: string, defaultValue: string, variableValues?: string[]) => string, state?: boolean): string {
    return state === undefined
        ? translate('ariaIndeterminate', 'indeterminate')
        : (state === true
            ? translate('ariaChecked', 'checked')
            : translate('ariaUnchecked', 'unchecked')
        );
}

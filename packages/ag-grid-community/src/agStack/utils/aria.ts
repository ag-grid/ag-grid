import type { LocaleTextFunc } from '../interfaces/iLocaleService';

/** Per https://www.w3.org/TR/wai-aria/#aria-sort](https://www.w3.org/TR/wai-aria/#aria-sort:~:text=integer-,aria%2Dsort%20property,-Indicates%20if%20items */
export type AriaSortState = 'ascending' | 'descending' | 'other' | 'none';

export type DisplaySortDef =
    | SortDef
    | {
          direction: 'mixed';
          type: SortType;
      };

export type SortDirection = 'asc' | 'desc' | null;

export type SortType = 'absolute' | 'default';

export type SortDef = {
    type: SortType;
    direction: SortDirection;
};

// ARIA HELPER FUNCTIONS
function _toggleAriaAttribute(element: Element, attribute: string, value?: number | boolean | string | null) {
    if (value == null || (typeof value === 'string' && value == '')) {
        _removeAriaAttribute(element, attribute);
    } else {
        _setAriaAttribute(element, attribute, value);
    }
}

function _setAriaAttribute(element: Element, attribute: string, value: number | boolean | string): void {
    element.setAttribute(_ariaAttributeName(attribute), value.toString());
}

function _removeAriaAttribute(element: Element, attribute: string): void {
    element.removeAttribute(_ariaAttributeName(attribute));
}

function _ariaAttributeName(attribute: string) {
    return `aria-${attribute}`;
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaRole(element: Element, role?: string | null) {
    if (role) {
        element.setAttribute('role', role);
    } else {
        element.removeAttribute('role');
    }
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _getAriaSortState(directionOrDef: DisplaySortDef | null): AriaSortState {
    const direction = directionOrDef?.direction;

    if (direction === 'asc') {
        return 'ascending';
    } else if (direction === 'desc') {
        return 'descending';
    } else if (direction === 'mixed') {
        return 'other';
    }

    return 'none';
}

// ARIA ATTRIBUTE GETTERS
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _getAriaPosInSet(element: Element): number {
    return Number.parseInt(element.getAttribute('aria-posinset')!, 10);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _getAriaLabel(element: Element): string | null {
    return element.getAttribute('aria-label');
}

// ARIA ATTRIBUTE SETTERS
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaLabel(element: Element, label?: string | null): void {
    _toggleAriaAttribute(element, 'label', label);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaLabelledBy(element: Element, labelledBy?: string): void {
    _toggleAriaAttribute(element, 'labelledby', labelledBy);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaDescribedBy(element: Element, describedby?: string): void {
    _toggleAriaAttribute(element, 'describedby', describedby);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaLive(element: Element, live?: 'polite' | 'assertive' | 'off' | null) {
    _toggleAriaAttribute(element, 'live', live);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaAtomic(element: Element, atomic: boolean | null) {
    _toggleAriaAttribute(element, 'atomic', atomic);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaRelevant(
    element: Element,
    relevant: 'additions' | 'additions text' | 'all' | 'removals' | 'text' | null
) {
    _toggleAriaAttribute(element, 'relevant', relevant);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaInvalid(element: Element, invalid: boolean) {
    _toggleAriaAttribute(element, 'invalid', invalid);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaLevel(element: Element, level: number): void {
    _toggleAriaAttribute(element, 'level', level);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaDisabled(element: Element, disabled: boolean): void {
    _toggleAriaAttribute(element, 'disabled', disabled);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaHidden(element: Element, hidden: boolean): void {
    _toggleAriaAttribute(element, 'hidden', hidden);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaActiveDescendant(element: Element, descendantId: string | null): void {
    _toggleAriaAttribute(element, 'activedescendant', descendantId);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaExpanded(element: Element, expanded: boolean): void {
    _setAriaAttribute(element, 'expanded', expanded);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _removeAriaExpanded(element: Element): void {
    _removeAriaAttribute(element, 'expanded');
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaSetSize(element: Element, setsize: number): void {
    _setAriaAttribute(element, 'setsize', setsize);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaPosInSet(element: Element, position: number): void {
    _setAriaAttribute(element, 'posinset', position);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaMultiSelectable(element: Element, multiSelectable: boolean): void {
    _setAriaAttribute(element, 'multiselectable', multiSelectable);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaRowCount(element: Element, rowCount: number): void {
    _setAriaAttribute(element, 'rowcount', rowCount);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaRowIndex(element: Element, rowIndex: number): void {
    _setAriaAttribute(element, 'rowindex', rowIndex);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaRowSpan(element: Element, spanCount: number): void {
    _setAriaAttribute(element, 'rowspan', spanCount);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaColCount(element: Element, colCount: number): void {
    _setAriaAttribute(element, 'colcount', colCount);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaColIndex(element: Element, colIndex: number): void {
    _setAriaAttribute(element, 'colindex', colIndex);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaColSpan(element: Element, colSpan: number): void {
    _setAriaAttribute(element, 'colspan', colSpan);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaSort(element: Element, sort: AriaSortState): void {
    _setAriaAttribute(element, 'sort', sort);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _removeAriaSort(element: Element): void {
    _removeAriaAttribute(element, 'sort');
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaSelected(element: Element, selected?: boolean): void {
    _toggleAriaAttribute(element, 'selected', selected);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaChecked(element: Element, checked?: boolean) {
    _setAriaAttribute(element, 'checked', checked === undefined ? 'mixed' : checked);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaControls(controllerElement: Element, controlledId?: string | null) {
    _toggleAriaAttribute(controllerElement, 'controls', controlledId);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaControlsAndLabel(controllerElement: Element, controlledElement: Element) {
    _setAriaControls(controllerElement, controlledElement.id);
    _setAriaLabelledBy(controlledElement, controllerElement.id);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaOwns(ownerElement: Element, ownedId?: string | null) {
    _toggleAriaAttribute(ownerElement, 'owns', ownedId);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _setAriaHasPopup(
    element: Element,
    hasPopup: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | boolean
) {
    _toggleAriaAttribute(element, 'haspopup', hasPopup === false ? null : hasPopup);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _getAriaCheckboxStateName(translate: LocaleTextFunc, state?: boolean): string {
    return state === undefined
        ? translate('ariaIndeterminate', 'indeterminate')
        : state === true
          ? translate('ariaChecked', 'checked')
          : translate('ariaUnchecked', 'unchecked');
}

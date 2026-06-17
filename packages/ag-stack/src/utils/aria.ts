import type { LocaleTextFunc } from '../interfaces/iLocaleService';

/**
 * Per https://www.w3.org/TR/wai-aria/#aria-sort](https://www.w3.org/TR/wai-aria/#aria-sort:~:text=integer-,aria%2Dsort%20property,-Indicates%20if%20items
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type AriaSortState = 'ascending' | 'descending' | 'other' | 'none';

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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaRole(element: Element, role?: string | null) {
    if (role) {
        element.setAttribute('role', role);
    } else {
        element.removeAttribute('role');
    }
}

// ARIA ATTRIBUTE GETTERS
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getAriaPosInSet(element: Element): number {
    return Number.parseInt(element.getAttribute('aria-posinset')!, 10);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getAriaLabel(element: Element): string | null {
    return element.getAttribute('aria-label');
}

// ARIA ATTRIBUTE SETTERS
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaLabel(element: Element, label?: string | null): void {
    _toggleAriaAttribute(element, 'label', label);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaLabelledBy(element: Element, labelledBy?: string): void {
    _toggleAriaAttribute(element, 'labelledby', labelledBy);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaDescribedBy(element: Element, describedby?: string): void {
    _toggleAriaAttribute(element, 'describedby', describedby);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaLive(element: Element, live?: 'polite' | 'assertive' | 'off' | null) {
    _toggleAriaAttribute(element, 'live', live);
}

export function _setAriaAtomic(element: Element, atomic: boolean | null) {
    _toggleAriaAttribute(element, 'atomic', atomic);
}

export function _setAriaRelevant(
    element: Element,
    relevant: 'additions' | 'additions text' | 'all' | 'removals' | 'text' | null
) {
    _toggleAriaAttribute(element, 'relevant', relevant);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaInvalid(element: Element, invalid: boolean) {
    _toggleAriaAttribute(element, 'invalid', invalid);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaLevel(element: Element, level: number): void {
    _toggleAriaAttribute(element, 'level', level);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaDisabled(element: Element, disabled: boolean): void {
    _toggleAriaAttribute(element, 'disabled', disabled);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaHidden(element: Element, hidden: boolean): void {
    _toggleAriaAttribute(element, 'hidden', hidden);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaActiveDescendant(element: Element, descendantId: string | null): void {
    _toggleAriaAttribute(element, 'activedescendant', descendantId);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaAutoComplete(element: Element, autoComplete: 'none' | 'inline' | 'list' | 'both'): void {
    _setAriaAttribute(element, 'autocomplete', autoComplete);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaExpanded(element: Element, expanded: boolean): void {
    _setAriaAttribute(element, 'expanded', expanded);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _removeAriaExpanded(element: Element): void {
    _removeAriaAttribute(element, 'expanded');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaSetSize(element: Element, setsize: number): void {
    _setAriaAttribute(element, 'setsize', setsize);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaPosInSet(element: Element, position: number): void {
    _setAriaAttribute(element, 'posinset', position);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaMultiSelectable(element: Element, multiSelectable: boolean): void {
    _setAriaAttribute(element, 'multiselectable', multiSelectable);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaRowCount(element: Element, rowCount: number): void {
    _setAriaAttribute(element, 'rowcount', rowCount);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaRowIndex(element: Element, rowIndex: number): void {
    _setAriaAttribute(element, 'rowindex', rowIndex);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaRowSpan(element: Element, spanCount: number): void {
    _setAriaAttribute(element, 'rowspan', spanCount);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaColCount(element: Element, colCount: number): void {
    _setAriaAttribute(element, 'colcount', colCount);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaColIndex(element: Element, colIndex: number): void {
    _setAriaAttribute(element, 'colindex', colIndex);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaColSpan(element: Element, colSpan: number): void {
    _setAriaAttribute(element, 'colspan', colSpan);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaSort(element: Element, sort: AriaSortState): void {
    _setAriaAttribute(element, 'sort', sort);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _removeAriaSort(element: Element): void {
    _removeAriaAttribute(element, 'sort');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaSelected(element: Element, selected?: boolean): void {
    _toggleAriaAttribute(element, 'selected', selected);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaChecked(element: Element, checked?: boolean) {
    _setAriaAttribute(element, 'checked', checked === undefined ? 'mixed' : checked);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaControls(controllerElement: Element, controlledId?: string | null) {
    _toggleAriaAttribute(controllerElement, 'controls', controlledId);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaControlsAndLabel(controllerElement: Element, controlledElement: Element) {
    _setAriaControls(controllerElement, controlledElement.id);
    _setAriaLabelledBy(controlledElement, controllerElement.id);
}

export function _setAriaOwns(ownerElement: Element, ownedId?: string | null) {
    _toggleAriaAttribute(ownerElement, 'owns', ownedId);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaHasPopup(
    element: Element,
    hasPopup: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | boolean
) {
    _toggleAriaAttribute(element, 'haspopup', hasPopup === false ? null : hasPopup);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getAriaCheckboxStateName(translate: LocaleTextFunc, state?: boolean): string {
    return state === undefined
        ? translate('ariaIndeterminate', 'indeterminate')
        : state === true
          ? translate('ariaChecked', 'checked')
          : translate('ariaUnchecked', 'unchecked');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setAriaOrientation(element: Element, orientation?: 'horizontal' | 'vertical'): void {
    if (orientation) {
        _setAriaAttribute(element, 'orientation', orientation);
    } else {
        _removeAriaAttribute(element, 'orientation');
    }
}

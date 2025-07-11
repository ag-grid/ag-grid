import type { LocaleTextFunc } from '../agStack/interfaces/iLocaleService';
import { _removeAriaAttribute, _setAriaAttribute, _toggleAriaAttribute } from '../agStack/utils/ariaUtils';
import type { SortDirection } from '../entities/colDef';

export type ColumnSortState = 'ascending' | 'descending' | 'other' | 'none';

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

// ARIA ATTRIBUTE SETTERS
export function _setAriaDescribedBy(element: Element, describedby?: string): void {
    _toggleAriaAttribute(element, 'describedby', describedby);
}

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

export function _setAriaInvalid(element: Element, invalid: boolean) {
    _toggleAriaAttribute(element, 'invalid', invalid);
}

export function _setAriaLevel(element: Element, level: number): void {
    _toggleAriaAttribute(element, 'level', level);
}

export function _setAriaDisabled(element: Element, disabled: boolean): void {
    _toggleAriaAttribute(element, 'disabled', disabled);
}

export function _setAriaActiveDescendant(element: Element, descendantId: string | null): void {
    _toggleAriaAttribute(element, 'activedescendant', descendantId);
}

export function _removeAriaExpanded(element: Element): void {
    _removeAriaAttribute(element, 'expanded');
}

export function _setAriaMultiSelectable(element: Element, multiSelectable: boolean): void {
    _setAriaAttribute(element, 'multiselectable', multiSelectable);
}

export function _setAriaRowCount(element: Element, rowCount: number): void {
    _setAriaAttribute(element, 'rowcount', rowCount);
}

export function _setAriaRowIndex(element: Element, rowIndex: number): void {
    _setAriaAttribute(element, 'rowindex', rowIndex);
}

export function _setAriaRowSpan(element: Element, spanCount: number): void {
    _setAriaAttribute(element, 'rowspan', spanCount);
}

export function _setAriaColCount(element: Element, colCount: number): void {
    _setAriaAttribute(element, 'colcount', colCount);
}

export function _setAriaColIndex(element: Element, colIndex: number): void {
    _setAriaAttribute(element, 'colindex', colIndex);
}

export function _setAriaColSpan(element: Element, colSpan: number): void {
    _setAriaAttribute(element, 'colspan', colSpan);
}

export function _setAriaSort(element: Element, sort: ColumnSortState): void {
    _setAriaAttribute(element, 'sort', sort);
}

export function _removeAriaSort(element: Element): void {
    _removeAriaAttribute(element, 'sort');
}

export function _setAriaChecked(element: Element, checked?: boolean) {
    _setAriaAttribute(element, 'checked', checked === undefined ? 'mixed' : checked);
}

export function _setAriaHasPopup(
    element: Element,
    hasPopup: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | boolean
) {
    _toggleAriaAttribute(element, 'haspopup', hasPopup === false ? null : hasPopup);
}

export function _getAriaCheckboxStateName(translate: LocaleTextFunc, state?: boolean): string {
    return state === undefined
        ? translate('ariaIndeterminate', 'indeterminate')
        : state === true
          ? translate('ariaChecked', 'checked')
          : translate('ariaUnchecked', 'unchecked');
}

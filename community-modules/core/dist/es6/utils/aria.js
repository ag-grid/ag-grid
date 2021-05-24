/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
// ARIA HELPER FUNCTIONS
function setAriaAttribute(element, attribute, value) {
    element.setAttribute(ariaAttributeName(attribute), value.toString());
}
function removeAriaAttribute(element, attribute) {
    element.removeAttribute(ariaAttributeName(attribute));
}
function ariaAttributeName(attribute) {
    return "aria-" + attribute;
}
export function getAriaSortState(column) {
    var sort;
    if (column.isSortAscending()) {
        sort = 'ascending';
    }
    else if (column.isSortDescending()) {
        sort = 'descending';
    }
    else {
        sort = 'none';
    }
    return sort;
}
// ARIA ATTRIBUTE GETTERS
export function getAriaLevel(element) {
    return parseInt(element.getAttribute('aria-level'), 10);
}
export function getAriaPosInSet(element) {
    return parseInt(element.getAttribute('aria-posinset'), 10);
}
export function getAriaDescribedBy(element) {
    return element.getAttribute('aria-describedby') || '';
}
// ARIA ATTRIBUTE SETTERS
export function setAriaLabel(element, label) {
    setAriaAttribute(element, 'label', label);
}
export function setAriaLabelledBy(element, labelledBy) {
    setAriaAttribute(element, 'labelledby', labelledBy);
}
export function setAriaDescribedBy(element, describedby) {
    setAriaAttribute(element, 'describedby', describedby);
}
export function setAriaLevel(element, level) {
    setAriaAttribute(element, 'level', level);
}
export function setAriaDisabled(element, disabled) {
    setAriaAttribute(element, 'disabled', disabled);
}
export function setAriaExpanded(element, expanded) {
    setAriaAttribute(element, 'expanded', expanded);
}
export function removeAriaExpanded(element) {
    removeAriaAttribute(element, 'expanded');
}
export function setAriaSetSize(element, setsize) {
    setAriaAttribute(element, 'setsize', setsize);
}
export function setAriaPosInSet(element, position) {
    setAriaAttribute(element, 'posinset', position);
}
export function setAriaMultiSelectable(element, multiSelectable) {
    setAriaAttribute(element, 'multiselectable', multiSelectable);
}
export function setAriaRowCount(element, rowCount) {
    setAriaAttribute(element, 'rowcount', rowCount);
}
export function setAriaRowIndex(element, rowIndex) {
    setAriaAttribute(element, 'rowindex', rowIndex);
}
export function setAriaColCount(element, colCount) {
    setAriaAttribute(element, 'colcount', colCount);
}
export function setAriaColIndex(element, colIndex) {
    setAriaAttribute(element, 'colindex', colIndex);
}
export function setAriaColSpan(element, colSpan) {
    setAriaAttribute(element, 'colspan', colSpan);
}
export function setAriaSort(element, sort) {
    setAriaAttribute(element, 'sort', sort);
}
export function removeAriaSort(element) {
    removeAriaAttribute(element, 'sort');
}
export function setAriaSelected(element, selected) {
    var attributeName = 'selected';
    if (selected) {
        setAriaAttribute(element, attributeName, selected);
    }
    else {
        removeAriaAttribute(element, attributeName);
    }
}
export function setAriaChecked(element, checked) {
    setAriaAttribute(element, 'checked', checked === undefined ? 'mixed' : checked);
}

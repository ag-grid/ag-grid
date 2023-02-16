/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
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
export function setAriaRole(element, role) {
    if (role) {
        element.setAttribute('role', role);
    }
    else {
        element.removeAttribute('role');
    }
}
export function getAriaSortState(sortDirection) {
    var sort;
    if (sortDirection === 'asc') {
        sort = 'ascending';
    }
    else if (sortDirection === 'desc') {
        sort = 'descending';
    }
    else if (sortDirection === 'mixed') {
        sort = 'other';
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
    var key = 'label';
    if (label != null && label !== '') {
        setAriaAttribute(element, key, label);
    }
    else {
        removeAriaAttribute(element, key);
    }
}
export function setAriaLabelledBy(element, labelledBy) {
    var key = 'labelledby';
    if (labelledBy) {
        setAriaAttribute(element, key, labelledBy);
    }
    else {
        removeAriaAttribute(element, key);
    }
}
export function setAriaDescription(element, description) {
    var key = 'description';
    if (description) {
        setAriaAttribute(element, key, description);
    }
    else {
        removeAriaAttribute(element, key);
    }
}
export function setAriaDescribedBy(element, describedby) {
    var key = 'describedby';
    if (describedby) {
        setAriaAttribute(element, key, describedby);
    }
    else {
        removeAriaAttribute(element, key);
    }
}
export function setAriaLevel(element, level) {
    setAriaAttribute(element, 'level', level);
}
export function setAriaDisabled(element, disabled) {
    setAriaAttribute(element, 'disabled', disabled);
}
export function setAriaHidden(element, hidden) {
    if (hidden) {
        setAriaAttribute(element, 'hidden', true);
    }
    else {
        removeAriaAttribute(element, 'hidden');
    }
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

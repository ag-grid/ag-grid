/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAriaChecked = exports.setAriaSelected = exports.removeAriaSort = exports.setAriaSort = exports.setAriaColSpan = exports.setAriaColIndex = exports.setAriaColCount = exports.setAriaRowIndex = exports.setAriaRowCount = exports.setAriaMultiSelectable = exports.setAriaPosInSet = exports.setAriaSetSize = exports.removeAriaExpanded = exports.setAriaExpanded = exports.setAriaHidden = exports.setAriaDisabled = exports.setAriaLevel = exports.setAriaLive = exports.setAriaDescribedBy = exports.setAriaDescription = exports.setAriaLabelledBy = exports.setAriaLabel = exports.getAriaDescribedBy = exports.getAriaPosInSet = exports.getAriaLevel = exports.getAriaSortState = exports.setAriaRole = void 0;
// ARIA HELPER FUNCTIONS
function toggleAriaAttribute(element, attribute, value) {
    if (value == null || value == '') {
        removeAriaAttribute(element, attribute);
    }
    else {
        setAriaAttribute(element, attribute, value);
    }
}
function setAriaAttribute(element, attribute, value) {
    element.setAttribute(ariaAttributeName(attribute), value.toString());
}
function removeAriaAttribute(element, attribute) {
    element.removeAttribute(ariaAttributeName(attribute));
}
function ariaAttributeName(attribute) {
    return `aria-${attribute}`;
}
function setAriaRole(element, role) {
    if (role) {
        element.setAttribute('role', role);
    }
    else {
        element.removeAttribute('role');
    }
}
exports.setAriaRole = setAriaRole;
function getAriaSortState(sortDirection) {
    let sort;
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
exports.getAriaSortState = getAriaSortState;
// ARIA ATTRIBUTE GETTERS
function getAriaLevel(element) {
    return parseInt(element.getAttribute('aria-level'), 10);
}
exports.getAriaLevel = getAriaLevel;
function getAriaPosInSet(element) {
    return parseInt(element.getAttribute('aria-posinset'), 10);
}
exports.getAriaPosInSet = getAriaPosInSet;
function getAriaDescribedBy(element) {
    return element.getAttribute('aria-describedby') || '';
}
exports.getAriaDescribedBy = getAriaDescribedBy;
// ARIA ATTRIBUTE SETTERS
function setAriaLabel(element, label) {
    toggleAriaAttribute(element, 'label', label);
}
exports.setAriaLabel = setAriaLabel;
function setAriaLabelledBy(element, labelledBy) {
    toggleAriaAttribute(element, 'labelledby', labelledBy);
}
exports.setAriaLabelledBy = setAriaLabelledBy;
function setAriaDescription(element, description) {
    toggleAriaAttribute(element, 'description', description);
}
exports.setAriaDescription = setAriaDescription;
function setAriaDescribedBy(element, describedby) {
    toggleAriaAttribute(element, 'describedby', describedby);
}
exports.setAriaDescribedBy = setAriaDescribedBy;
function setAriaLive(element, live) {
    toggleAriaAttribute(element, 'live', live);
}
exports.setAriaLive = setAriaLive;
function setAriaLevel(element, level) {
    toggleAriaAttribute(element, 'level', level);
}
exports.setAriaLevel = setAriaLevel;
function setAriaDisabled(element, disabled) {
    toggleAriaAttribute(element, 'disabled', disabled);
}
exports.setAriaDisabled = setAriaDisabled;
function setAriaHidden(element, hidden) {
    toggleAriaAttribute(element, 'hidden', hidden);
}
exports.setAriaHidden = setAriaHidden;
function setAriaExpanded(element, expanded) {
    setAriaAttribute(element, 'expanded', expanded);
}
exports.setAriaExpanded = setAriaExpanded;
function removeAriaExpanded(element) {
    removeAriaAttribute(element, 'expanded');
}
exports.removeAriaExpanded = removeAriaExpanded;
function setAriaSetSize(element, setsize) {
    setAriaAttribute(element, 'setsize', setsize);
}
exports.setAriaSetSize = setAriaSetSize;
function setAriaPosInSet(element, position) {
    setAriaAttribute(element, 'posinset', position);
}
exports.setAriaPosInSet = setAriaPosInSet;
function setAriaMultiSelectable(element, multiSelectable) {
    setAriaAttribute(element, 'multiselectable', multiSelectable);
}
exports.setAriaMultiSelectable = setAriaMultiSelectable;
function setAriaRowCount(element, rowCount) {
    setAriaAttribute(element, 'rowcount', rowCount);
}
exports.setAriaRowCount = setAriaRowCount;
function setAriaRowIndex(element, rowIndex) {
    setAriaAttribute(element, 'rowindex', rowIndex);
}
exports.setAriaRowIndex = setAriaRowIndex;
function setAriaColCount(element, colCount) {
    setAriaAttribute(element, 'colcount', colCount);
}
exports.setAriaColCount = setAriaColCount;
function setAriaColIndex(element, colIndex) {
    setAriaAttribute(element, 'colindex', colIndex);
}
exports.setAriaColIndex = setAriaColIndex;
function setAriaColSpan(element, colSpan) {
    setAriaAttribute(element, 'colspan', colSpan);
}
exports.setAriaColSpan = setAriaColSpan;
function setAriaSort(element, sort) {
    setAriaAttribute(element, 'sort', sort);
}
exports.setAriaSort = setAriaSort;
function removeAriaSort(element) {
    removeAriaAttribute(element, 'sort');
}
exports.removeAriaSort = removeAriaSort;
function setAriaSelected(element, selected) {
    toggleAriaAttribute(element, 'selected', selected);
}
exports.setAriaSelected = setAriaSelected;
function setAriaChecked(element, checked) {
    setAriaAttribute(element, 'checked', checked === undefined ? 'mixed' : checked);
}
exports.setAriaChecked = setAriaChecked;

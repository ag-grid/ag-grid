/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAriaChecked = exports.setAriaSelected = exports.removeAriaSort = exports.setAriaSort = exports.setAriaColSpan = exports.setAriaColIndex = exports.setAriaColCount = exports.setAriaRowIndex = exports.setAriaRowCount = exports.setAriaMultiSelectable = exports.setAriaPosInSet = exports.setAriaSetSize = exports.removeAriaExpanded = exports.setAriaExpanded = exports.setAriaHidden = exports.setAriaDisabled = exports.setAriaLevel = exports.setAriaDescribedBy = exports.setAriaDescription = exports.setAriaLabelledBy = exports.setAriaLabel = exports.getAriaDescribedBy = exports.getAriaPosInSet = exports.getAriaLevel = exports.getAriaSortState = exports.setAriaRole = void 0;
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
    var key = 'label';
    if (label != null && label !== '') {
        setAriaAttribute(element, key, label);
    }
    else {
        removeAriaAttribute(element, key);
    }
}
exports.setAriaLabel = setAriaLabel;
function setAriaLabelledBy(element, labelledBy) {
    var key = 'labelledby';
    if (labelledBy) {
        setAriaAttribute(element, key, labelledBy);
    }
    else {
        removeAriaAttribute(element, key);
    }
}
exports.setAriaLabelledBy = setAriaLabelledBy;
function setAriaDescription(element, description) {
    var key = 'description';
    if (description) {
        setAriaAttribute(element, key, description);
    }
    else {
        removeAriaAttribute(element, key);
    }
}
exports.setAriaDescription = setAriaDescription;
function setAriaDescribedBy(element, describedby) {
    var key = 'describedby';
    if (describedby) {
        setAriaAttribute(element, key, describedby);
    }
    else {
        removeAriaAttribute(element, key);
    }
}
exports.setAriaDescribedBy = setAriaDescribedBy;
function setAriaLevel(element, level) {
    setAriaAttribute(element, 'level', level);
}
exports.setAriaLevel = setAriaLevel;
function setAriaDisabled(element, disabled) {
    setAriaAttribute(element, 'disabled', disabled);
}
exports.setAriaDisabled = setAriaDisabled;
function setAriaHidden(element, hidden) {
    if (hidden) {
        setAriaAttribute(element, 'hidden', true);
    }
    else {
        removeAriaAttribute(element, 'hidden');
    }
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
    var attributeName = 'selected';
    if (selected) {
        setAriaAttribute(element, attributeName, selected);
    }
    else {
        removeAriaAttribute(element, attributeName);
    }
}
exports.setAriaSelected = setAriaSelected;
function setAriaChecked(element, checked) {
    setAriaAttribute(element, 'checked', checked === undefined ? 'mixed' : checked);
}
exports.setAriaChecked = setAriaChecked;

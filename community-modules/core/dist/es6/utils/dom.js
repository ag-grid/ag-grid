/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { isBrowserChrome, isBrowserSafari } from './browser';
import { exists } from './generic';
import { isNonNullObject } from './object';
import { hyphenToCamelCase } from './string';
import { Constants } from '../constants/constants';
var rtlNegativeScroll;
export function addCssClass(element, className) {
    if (!element || !className || className.length === 0) {
        return;
    }
    if (className.indexOf(' ') >= 0) {
        className.split(' ').forEach(function (value) { return addCssClass(element, value); });
        return;
    }
    if (element.classList) {
        element.classList.add(className);
    }
    else if (element.className && element.className.length > 0) {
        var cssClasses = element.className.split(' ');
        if (cssClasses.indexOf(className) < 0) {
            cssClasses.push(className);
            element.setAttribute('class', cssClasses.join(' '));
        }
    }
    else {
        // do not use element.classList = className here, it will cause
        // a read-only assignment error on some browsers (IE/Edge).
        element.setAttribute('class', className);
    }
    return element;
}
export function removeCssClass(element, className) {
    if (!element || !className || className.length === 0) {
        return;
    }
    if (className.indexOf(' ') >= 0) {
        className.split(' ').forEach(function (value) { return removeCssClass(element, value); });
        return;
    }
    if (element.classList) {
        element.classList.remove(className);
    }
    else if (element.className && element.className.length > 0) {
        var newClassName = element.className.split(' ').filter(function (c) { return c !== className; }).join(' ');
        element.setAttribute('class', newClassName);
    }
}
export function addOrRemoveCssClass(element, className, addOrRemove) {
    if (addOrRemove) {
        addCssClass(element, className);
    }
    else {
        removeCssClass(element, className);
    }
}
/**
 * This method adds a class to an element and remove that class from all siblings.
 * Useful for toggling state.
 * @param {HTMLElement} element The element to receive the class
 * @param {string} elementClass The class to be assigned to the element
 * @param {boolean} otherElementClass The class to be assigned to siblings of the element, but not the element itself
 */
export function radioCssClass(element, elementClass, otherElementClass) {
    var parent = element.parentElement;
    var sibling = parent && parent.firstChild;
    while (sibling) {
        if (elementClass) {
            addOrRemoveCssClass(sibling, elementClass, sibling === element);
        }
        if (otherElementClass) {
            addOrRemoveCssClass(sibling, otherElementClass, sibling !== element);
        }
        sibling = sibling.nextSibling;
    }
}
export function containsClass(element, className) {
    if (element.classList) {
        // for modern browsers
        return element.classList.contains(className);
    }
    if (element.className) {
        // for older browsers, check against the string of class names
        // if only one class, can check for exact match
        var onlyClass = element.className === className;
        // if many classes, check for class name, we have to pad with ' ' to stop other
        // class names that are a substring of this class
        var contains = element.className.indexOf(' ' + className + ' ') >= 0;
        // the padding above then breaks when it's the first or last class names
        var startsWithClass = element.className.indexOf(className + ' ') === 0;
        var endsWithClass = element.className.lastIndexOf(' ' + className) === (element.className.length - className.length - 1);
        return onlyClass || contains || startsWithClass || endsWithClass;
    }
    // if item is not a node
    return false;
}
export function isFocusableFormField(element) {
    var matches = Element.prototype.matches || Element.prototype.msMatchesSelector;
    var isFocusable = matches.call(element, Constants.INPUT_SELECTOR);
    var isNotFocusable = matches.call(element, Constants.FOCUSABLE_EXCLUDE);
    var isElementVisible = isVisible(element);
    var focusable = isFocusable && !isNotFocusable && isElementVisible;
    return focusable;
}
export function setDisplayed(element, displayed) {
    addOrRemoveCssClass(element, 'ag-hidden', !displayed);
}
export function setVisible(element, visible) {
    addOrRemoveCssClass(element, 'ag-invisible', !visible);
}
export function setDisabled(element, disabled) {
    var attributeName = 'disabled';
    var addOrRemoveDisabledAttribute = disabled ?
        function (e) { return e.setAttribute(attributeName, ''); } :
        function (e) { return e.removeAttribute(attributeName); };
    addOrRemoveDisabledAttribute(element);
    nodeListForEach(element.querySelectorAll('input'), function (input) { return addOrRemoveDisabledAttribute(input); });
}
export function isElementChildOfClass(element, cls, maxNest) {
    var counter = 0;
    while (element) {
        if (containsClass(element, cls)) {
            return true;
        }
        element = element.parentElement;
        if (maxNest && ++counter > maxNest) {
            break;
        }
    }
    return false;
}
// returns back sizes as doubles instead of strings. similar to
// getBoundingClientRect, however getBoundingClientRect does not:
// a) work with fractions (eg browser is zooming)
// b) has CSS transitions applied (eg CSS scale, browser zoom), which we don't want, we want the un-transitioned values
export function getElementSize(el) {
    var _a = window.getComputedStyle(el), height = _a.height, width = _a.width, paddingTop = _a.paddingTop, paddingRight = _a.paddingRight, paddingBottom = _a.paddingBottom, paddingLeft = _a.paddingLeft, marginTop = _a.marginTop, marginRight = _a.marginRight, marginBottom = _a.marginBottom, marginLeft = _a.marginLeft, boxSizing = _a.boxSizing;
    return {
        height: parseFloat(height),
        width: parseFloat(width),
        paddingTop: parseFloat(paddingTop),
        paddingRight: parseFloat(paddingRight),
        paddingBottom: parseFloat(paddingBottom),
        paddingLeft: parseFloat(paddingLeft),
        marginTop: parseFloat(marginTop),
        marginRight: parseFloat(marginRight),
        marginBottom: parseFloat(marginBottom),
        marginLeft: parseFloat(marginLeft),
        boxSizing: boxSizing
    };
}
export function getInnerHeight(el) {
    var size = getElementSize(el);
    if (size.boxSizing === 'border-box') {
        return size.height - size.paddingTop - size.paddingBottom;
    }
    return size.height;
}
export function getInnerWidth(el) {
    var size = getElementSize(el);
    if (size.boxSizing === 'border-box') {
        return size.width - size.paddingLeft - size.paddingRight;
    }
    return size.width;
}
export function getAbsoluteHeight(el) {
    var size = getElementSize(el);
    var marginRight = size.marginBottom + size.marginTop;
    return Math.ceil(el.offsetHeight + marginRight);
}
export function getAbsoluteWidth(el) {
    var size = getElementSize(el);
    var marginWidth = size.marginLeft + size.marginRight;
    return Math.ceil(el.offsetWidth + marginWidth);
}
export function isRtlNegativeScroll() {
    if (typeof rtlNegativeScroll === "boolean") {
        return rtlNegativeScroll;
    }
    var template = document.createElement('div');
    template.style.direction = 'rtl';
    template.style.width = '1px';
    template.style.height = '1px';
    template.style.position = 'fixed';
    template.style.top = '0px';
    template.style.overflow = 'hidden';
    template.dir = 'rtl';
    template.innerHTML = /* html */
        "<div style=\"width: 2px\">\n            <span style=\"display: inline-block; width: 1px\"></span>\n            <span style=\"display: inline-block; width: 1px\"></span>\n        </div>";
    document.body.appendChild(template);
    template.scrollLeft = 1;
    rtlNegativeScroll = Math.floor(template.scrollLeft) === 0;
    document.body.removeChild(template);
    return rtlNegativeScroll;
}
export function getScrollLeft(element, rtl) {
    var scrollLeft = element.scrollLeft;
    if (rtl) {
        // Absolute value - for FF that reports RTL scrolls in negative numbers
        scrollLeft = Math.abs(scrollLeft);
        if (isBrowserChrome() && !isRtlNegativeScroll()) {
            scrollLeft = element.scrollWidth - element.clientWidth - scrollLeft;
        }
    }
    return scrollLeft;
}
export function setScrollLeft(element, value, rtl) {
    if (rtl) {
        // Chrome and Safari when doing RTL have the END position of the scroll as zero, not the start
        if (isRtlNegativeScroll()) {
            value *= -1;
        }
        else if (isBrowserSafari() || isBrowserChrome()) {
            value = element.scrollWidth - element.clientWidth - value;
        }
    }
    element.scrollLeft = value;
}
export function clearElement(el) {
    while (el && el.firstChild) {
        el.removeChild(el.firstChild);
    }
}
/** @deprecated */
export function removeElement(parent, cssSelector) {
    removeFromParent(parent.querySelector(cssSelector));
}
export function removeFromParent(node) {
    if (node && node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
export function isVisible(element) {
    return element.offsetParent !== null;
}
/**
 * Loads the template and returns it as an element. makes up for no simple way in
 * the dom api to load html directly, eg we cannot do this: document.createElement(template)
 * @param {string} template
 * @returns {HTMLElement}
 */
export function loadTemplate(template) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = (template || '').trim();
    return tempDiv.firstChild;
}
export function appendHtml(eContainer, htmlTemplate) {
    if (eContainer.lastChild) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
        // we put the items at the start, so new items appear underneath old items,
        // so when expanding/collapsing groups, the new rows don't go on top of the
        // rows below that are moving our of the way
        eContainer.insertAdjacentHTML('afterbegin', htmlTemplate);
    }
    else {
        eContainer.innerHTML = htmlTemplate;
    }
}
/** @deprecated */
export function getElementAttribute(element, attributeName) {
    if (element.attributes && element.attributes[attributeName]) {
        var attribute = element.attributes[attributeName];
        return attribute.value;
    }
    return null;
}
export function offsetHeight(element) {
    return element && element.clientHeight ? element.clientHeight : 0;
}
export function offsetWidth(element) {
    return element && element.clientWidth ? element.clientWidth : 0;
}
export function ensureDomOrder(eContainer, eChild, eChildBefore) {
    // if already in right order, do nothing
    if (eChildBefore && eChildBefore.nextSibling === eChild) {
        return;
    }
    if (eChildBefore) {
        if (eChildBefore.nextSibling) {
            // insert between the eRowBefore and the row after it
            eContainer.insertBefore(eChild, eChildBefore.nextSibling);
        }
        else {
            // if nextSibling is missing, means other row is at end, so just append new row at the end
            eContainer.appendChild(eChild);
        }
    }
    else {
        // otherwise put at start
        if (eContainer.firstChild && eContainer.firstChild !== eChild) {
            // insert it at the first location
            eContainer.insertAdjacentElement('afterbegin', eChild);
        }
    }
}
export function setDomChildOrder(eContainer, orderedChildren) {
    for (var i = 0; i < orderedChildren.length; i++) {
        var correctCellAtIndex = orderedChildren[i];
        var actualCellAtIndex = eContainer.children[i];
        if (actualCellAtIndex !== correctCellAtIndex) {
            eContainer.insertBefore(correctCellAtIndex, actualCellAtIndex);
        }
    }
}
export function insertWithDomOrder(eContainer, eToInsert, eChildBefore) {
    if (eChildBefore) {
        // if previous element exists, just slot in after the previous element
        eChildBefore.insertAdjacentElement('afterend', eToInsert);
    }
    else {
        if (eContainer.firstChild) {
            // insert it at the first location
            eContainer.insertAdjacentElement('afterbegin', eToInsert);
        }
        else {
            // otherwise eContainer is empty, so just append it
            eContainer.appendChild(eToInsert);
        }
    }
}
/** @deprecated */
export function prependDC(parent, documentFragment) {
    if (exists(parent.firstChild)) {
        parent.insertBefore(documentFragment, parent.firstChild);
    }
    else {
        parent.appendChild(documentFragment);
    }
}
export function addStylesToElement(eElement, styles) {
    if (!styles) {
        return;
    }
    Object.keys(styles).forEach(function (key) {
        var keyCamelCase = hyphenToCamelCase(key);
        if (keyCamelCase) {
            eElement.style[keyCamelCase] = styles[key];
        }
    });
}
export function isHorizontalScrollShowing(element) {
    return element.clientWidth < element.scrollWidth;
}
export function isVerticalScrollShowing(element) {
    return element.clientHeight < element.scrollHeight;
}
export function setElementWidth(element, width) {
    if (width === 'flex') {
        element.style.removeProperty('width');
        element.style.removeProperty('minWidth');
        element.style.removeProperty('maxWidth');
        element.style.flex = '1 1 auto';
    }
    else {
        setFixedWidth(element, width);
    }
}
export function setFixedWidth(element, width) {
    width = formatSize(width);
    element.style.width = width.toString();
    element.style.maxWidth = width.toString();
    element.style.minWidth = width.toString();
}
export function setElementHeight(element, height) {
    if (height === 'flex') {
        element.style.removeProperty('height');
        element.style.removeProperty('minHeight');
        element.style.removeProperty('maxHeight');
        element.style.flex = '1 1 auto';
    }
    else {
        setFixedHeight(element, height);
    }
}
export function setFixedHeight(element, height) {
    height = formatSize(height);
    element.style.height = height.toString();
    element.style.maxHeight = height.toString();
    element.style.minHeight = height.toString();
}
export function formatSize(size) {
    if (typeof size === 'number') {
        return size + "px";
    }
    return size;
}
/**
 * Returns true if it is a DOM node
 * taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
 * @param {any} o
 * @return {boolean}
 */
export function isNode(o) {
    return (typeof Node === 'function'
        ? o instanceof Node
        : o && typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName === 'string');
}
//
/**
 * Returns true if it is a DOM element
 * taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
 * @param {any} o
 * @returns {boolean}
 */
export function isElement(o) {
    return (typeof HTMLElement === 'function'
        ? o instanceof HTMLElement //DOM2
        : o && isNonNullObject(o) && o.nodeType === 1 && typeof o.nodeName === 'string');
}
export function isNodeOrElement(o) {
    return isNode(o) || isElement(o);
}
/**
 * Makes a copy of a node list into a list
 * @param {NodeList} nodeList
 * @returns {Node[]}
 */
export function copyNodeList(nodeList) {
    if (nodeList == null) {
        return [];
    }
    var result = [];
    nodeListForEach(nodeList, function (node) { return result.push(node); });
    return result;
}
export function iterateNamedNodeMap(map, callback) {
    if (!map) {
        return;
    }
    for (var i = 0; i < map.length; i++) {
        var attr = map[i];
        callback(attr.name, attr.value);
    }
}
/** @deprecated */
export function setCheckboxState(eCheckbox, state) {
    if (typeof state === 'boolean') {
        eCheckbox.checked = state;
        eCheckbox.indeterminate = false;
    }
    else {
        // isNodeSelected returns back undefined if it's a group and the children
        // are a mix of selected and unselected
        eCheckbox.indeterminate = true;
    }
}
export function addOrRemoveAttribute(element, name, value) {
    if (value == null) {
        element.removeAttribute(name);
    }
    else {
        element.setAttribute(name, value.toString());
    }
}
export function nodeListForEach(nodeList, action) {
    if (nodeList == null) {
        return;
    }
    for (var i = 0; i < nodeList.length; i++) {
        action(nodeList[i]);
    }
}

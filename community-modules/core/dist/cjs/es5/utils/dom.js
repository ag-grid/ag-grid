/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeListForEach = exports.addOrRemoveAttribute = exports.iterateNamedNodeMap = exports.copyNodeList = exports.isNodeOrElement = exports.formatSize = exports.setFixedHeight = exports.setElementHeight = exports.setFixedWidth = exports.setElementWidth = exports.isVerticalScrollShowing = exports.isHorizontalScrollShowing = exports.addStylesToElement = exports.prependDC = exports.insertWithDomOrder = exports.setDomChildOrder = exports.ensureDomOrder = exports.offsetWidth = exports.offsetHeight = exports.getElementAttribute = exports.appendHtml = exports.loadTemplate = exports.isVisible = exports.removeFromParent = exports.removeElement = exports.clearElement = exports.setScrollLeft = exports.getScrollLeft = exports.isRtlNegativeScroll = exports.getAbsoluteWidth = exports.getAbsoluteHeight = exports.getInnerWidth = exports.getInnerHeight = exports.getElementSize = exports.isElementChildOfClass = exports.setDisabled = exports.setVisible = exports.setDisplayed = exports.isFocusableFormField = exports.FOCUSABLE_EXCLUDE = exports.FOCUSABLE_SELECTOR = exports.radioCssClass = void 0;
var browser_1 = require("./browser");
var generic_1 = require("./generic");
var aria_1 = require("./aria");
var rtlNegativeScroll;
/**
 * This method adds a class to an element and remove that class from all siblings.
 * Useful for toggling state.
 * @param {HTMLElement} element The element to receive the class
 * @param {string} elementClass The class to be assigned to the element
 * @param {boolean} otherElementClass The class to be assigned to siblings of the element, but not the element itself
 */
function radioCssClass(element, elementClass, otherElementClass) {
    var parent = element.parentElement;
    var sibling = parent && parent.firstChild;
    while (sibling) {
        if (elementClass) {
            sibling.classList.toggle(elementClass, sibling === element);
        }
        if (otherElementClass) {
            sibling.classList.toggle(otherElementClass, sibling !== element);
        }
        sibling = sibling.nextSibling;
    }
}
exports.radioCssClass = radioCssClass;
exports.FOCUSABLE_SELECTOR = '[tabindex], input, select, button, textarea, [href]';
exports.FOCUSABLE_EXCLUDE = '.ag-hidden, .ag-hidden *, [disabled], .ag-disabled, .ag-disabled *';
function isFocusableFormField(element) {
    var matches = Element.prototype.matches || Element.prototype.msMatchesSelector;
    var inputSelector = 'input, select, button, textarea';
    var isFocusable = matches.call(element, inputSelector);
    var isNotFocusable = matches.call(element, exports.FOCUSABLE_EXCLUDE);
    var isElementVisible = isVisible(element);
    var focusable = isFocusable && !isNotFocusable && isElementVisible;
    return focusable;
}
exports.isFocusableFormField = isFocusableFormField;
function setDisplayed(element, displayed, options) {
    if (options === void 0) { options = {}; }
    var skipAriaHidden = options.skipAriaHidden;
    element.classList.toggle('ag-hidden', !displayed);
    if (!skipAriaHidden) {
        aria_1.setAriaHidden(element, !displayed);
    }
}
exports.setDisplayed = setDisplayed;
function setVisible(element, visible, options) {
    if (options === void 0) { options = {}; }
    var skipAriaHidden = options.skipAriaHidden;
    element.classList.toggle('ag-invisible', !visible);
    if (!skipAriaHidden) {
        aria_1.setAriaHidden(element, !visible);
    }
}
exports.setVisible = setVisible;
function setDisabled(element, disabled) {
    var attributeName = 'disabled';
    var addOrRemoveDisabledAttribute = disabled ?
        function (e) { return e.setAttribute(attributeName, ''); } :
        function (e) { return e.removeAttribute(attributeName); };
    addOrRemoveDisabledAttribute(element);
    nodeListForEach(element.querySelectorAll('input'), function (input) { return addOrRemoveDisabledAttribute(input); });
}
exports.setDisabled = setDisabled;
function isElementChildOfClass(element, cls, maxNest) {
    var counter = 0;
    while (element) {
        if (element.classList.contains(cls)) {
            return true;
        }
        element = element.parentElement;
        if (typeof maxNest == 'number') {
            if (++counter > maxNest) {
                break;
            }
        }
        else if (element === maxNest) {
            break;
        }
    }
    return false;
}
exports.isElementChildOfClass = isElementChildOfClass;
// returns back sizes as doubles instead of strings. similar to
// getBoundingClientRect, however getBoundingClientRect does not:
// a) work with fractions (eg browser is zooming)
// b) has CSS transitions applied (eg CSS scale, browser zoom), which we don't want, we want the un-transitioned values
function getElementSize(el) {
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
exports.getElementSize = getElementSize;
function getInnerHeight(el) {
    var size = getElementSize(el);
    if (size.boxSizing === 'border-box') {
        return size.height - size.paddingTop - size.paddingBottom;
    }
    return size.height;
}
exports.getInnerHeight = getInnerHeight;
function getInnerWidth(el) {
    var size = getElementSize(el);
    if (size.boxSizing === 'border-box') {
        return size.width - size.paddingLeft - size.paddingRight;
    }
    return size.width;
}
exports.getInnerWidth = getInnerWidth;
function getAbsoluteHeight(el) {
    var size = getElementSize(el);
    var marginRight = size.marginBottom + size.marginTop;
    return Math.ceil(el.offsetHeight + marginRight);
}
exports.getAbsoluteHeight = getAbsoluteHeight;
function getAbsoluteWidth(el) {
    var size = getElementSize(el);
    var marginWidth = size.marginLeft + size.marginRight;
    return Math.ceil(el.offsetWidth + marginWidth);
}
exports.getAbsoluteWidth = getAbsoluteWidth;
function isRtlNegativeScroll() {
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
exports.isRtlNegativeScroll = isRtlNegativeScroll;
function getScrollLeft(element, rtl) {
    var scrollLeft = element.scrollLeft;
    if (rtl) {
        // Absolute value - for FF that reports RTL scrolls in negative numbers
        scrollLeft = Math.abs(scrollLeft);
        if (browser_1.isBrowserChrome() && !isRtlNegativeScroll()) {
            scrollLeft = element.scrollWidth - element.clientWidth - scrollLeft;
        }
    }
    return scrollLeft;
}
exports.getScrollLeft = getScrollLeft;
function setScrollLeft(element, value, rtl) {
    if (rtl) {
        // Chrome and Safari when doing RTL have the END position of the scroll as zero, not the start
        if (isRtlNegativeScroll()) {
            value *= -1;
        }
        else if (browser_1.isBrowserSafari() || browser_1.isBrowserChrome()) {
            value = element.scrollWidth - element.clientWidth - value;
        }
    }
    element.scrollLeft = value;
}
exports.setScrollLeft = setScrollLeft;
function clearElement(el) {
    while (el && el.firstChild) {
        el.removeChild(el.firstChild);
    }
}
exports.clearElement = clearElement;
/** @deprecated */
function removeElement(parent, cssSelector) {
    removeFromParent(parent.querySelector(cssSelector));
}
exports.removeElement = removeElement;
function removeFromParent(node) {
    if (node && node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
exports.removeFromParent = removeFromParent;
function isVisible(element) {
    return element.offsetParent !== null;
}
exports.isVisible = isVisible;
/**
 * Loads the template and returns it as an element. makes up for no simple way in
 * the dom api to load html directly, eg we cannot do this: document.createElement(template)
 * @param {string} template
 * @returns {HTMLElement}
 */
function loadTemplate(template) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = (template || '').trim();
    return tempDiv.firstChild;
}
exports.loadTemplate = loadTemplate;
function appendHtml(eContainer, htmlTemplate) {
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
exports.appendHtml = appendHtml;
/** @deprecated */
function getElementAttribute(element, attributeName) {
    if (element.attributes && element.attributes[attributeName]) {
        var attribute = element.attributes[attributeName];
        return attribute.value;
    }
    return null;
}
exports.getElementAttribute = getElementAttribute;
function offsetHeight(element) {
    return element && element.clientHeight ? element.clientHeight : 0;
}
exports.offsetHeight = offsetHeight;
function offsetWidth(element) {
    return element && element.clientWidth ? element.clientWidth : 0;
}
exports.offsetWidth = offsetWidth;
function ensureDomOrder(eContainer, eChild, eChildBefore) {
    // if already in right order, do nothing
    if (eChildBefore && eChildBefore.nextSibling === eChild) {
        return;
    }
    var focusedEl = document.activeElement;
    var eChildHasFocus = eChild.contains(focusedEl);
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
    if (eChildHasFocus && focusedEl && browser_1.browserSupportsPreventScroll()) {
        focusedEl.focus({ preventScroll: true });
    }
}
exports.ensureDomOrder = ensureDomOrder;
function setDomChildOrder(eContainer, orderedChildren) {
    for (var i = 0; i < orderedChildren.length; i++) {
        var correctCellAtIndex = orderedChildren[i];
        var actualCellAtIndex = eContainer.children[i];
        if (actualCellAtIndex !== correctCellAtIndex) {
            eContainer.insertBefore(correctCellAtIndex, actualCellAtIndex);
        }
    }
}
exports.setDomChildOrder = setDomChildOrder;
function insertWithDomOrder(eContainer, eToInsert, eChildBefore) {
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
exports.insertWithDomOrder = insertWithDomOrder;
/** @deprecated */
function prependDC(parent, documentFragment) {
    if (generic_1.exists(parent.firstChild)) {
        parent.insertBefore(documentFragment, parent.firstChild);
    }
    else {
        parent.appendChild(documentFragment);
    }
}
exports.prependDC = prependDC;
function addStylesToElement(eElement, styles) {
    if (!styles) {
        return;
    }
    Object.keys(styles).forEach(function (key) {
        if (!key || !key.length) {
            return;
        }
        // changes the key from camelCase into a hyphenated-string
        var parsedKey = key.replace(/[A-Z]/g, function (s) { return "-" + s.toLocaleLowerCase(); });
        var value = styles[key].replace(/\s*!important/g, '');
        var priority = value.length != styles[key].length ? 'important' : undefined;
        eElement.style.setProperty(parsedKey, value, priority);
    });
}
exports.addStylesToElement = addStylesToElement;
function isHorizontalScrollShowing(element) {
    return element.clientWidth < element.scrollWidth;
}
exports.isHorizontalScrollShowing = isHorizontalScrollShowing;
function isVerticalScrollShowing(element) {
    return element.clientHeight < element.scrollHeight;
}
exports.isVerticalScrollShowing = isVerticalScrollShowing;
function setElementWidth(element, width) {
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
exports.setElementWidth = setElementWidth;
function setFixedWidth(element, width) {
    width = formatSize(width);
    element.style.width = width.toString();
    element.style.maxWidth = width.toString();
    element.style.minWidth = width.toString();
}
exports.setFixedWidth = setFixedWidth;
function setElementHeight(element, height) {
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
exports.setElementHeight = setElementHeight;
function setFixedHeight(element, height) {
    height = formatSize(height);
    element.style.height = height.toString();
    element.style.maxHeight = height.toString();
    element.style.minHeight = height.toString();
}
exports.setFixedHeight = setFixedHeight;
function formatSize(size) {
    if (typeof size === 'number') {
        return size + "px";
    }
    return size;
}
exports.formatSize = formatSize;
function isNodeOrElement(o) {
    return o instanceof Node || o instanceof HTMLElement;
}
exports.isNodeOrElement = isNodeOrElement;
/**
 * Makes a copy of a node list into a list
 * @param {NodeList} nodeList
 * @returns {Node[]}
 */
function copyNodeList(nodeList) {
    if (nodeList == null) {
        return [];
    }
    var result = [];
    nodeListForEach(nodeList, function (node) { return result.push(node); });
    return result;
}
exports.copyNodeList = copyNodeList;
function iterateNamedNodeMap(map, callback) {
    if (!map) {
        return;
    }
    for (var i = 0; i < map.length; i++) {
        var attr = map[i];
        callback(attr.name, attr.value);
    }
}
exports.iterateNamedNodeMap = iterateNamedNodeMap;
function addOrRemoveAttribute(element, name, value) {
    if (value == null) {
        element.removeAttribute(name);
    }
    else {
        element.setAttribute(name, value.toString());
    }
}
exports.addOrRemoveAttribute = addOrRemoveAttribute;
function nodeListForEach(nodeList, action) {
    if (nodeList == null) {
        return;
    }
    for (var i = 0; i < nodeList.length; i++) {
        action(nodeList[i]);
    }
}
exports.nodeListForEach = nodeListForEach;

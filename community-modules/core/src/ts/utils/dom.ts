import { browserSupportsPreventScroll, isBrowserChrome, isBrowserSafari } from './browser';
import { exists } from './generic';
import { isNonNullObject } from './object';
import { hyphenToCamelCase } from './string';
import { Constants } from '../constants/constants';

let rtlNegativeScroll: boolean;

/**
 * This method adds a class to an element and remove that class from all siblings.
 * Useful for toggling state.
 * @param {HTMLElement} element The element to receive the class
 * @param {string} elementClass The class to be assigned to the element
 * @param {boolean} otherElementClass The class to be assigned to siblings of the element, but not the element itself
 */
export function radioCssClass(element: HTMLElement, elementClass: string | null, otherElementClass?: string | null) {
    const parent = element.parentElement;
    let sibling = parent && parent.firstChild as HTMLElement;

    while (sibling) {
        if (elementClass) {
            sibling.classList.toggle(elementClass, sibling === element);
        }
        if (otherElementClass) {
            sibling.classList.toggle(otherElementClass, sibling !== element);
        }
        sibling = sibling.nextSibling as HTMLElement;
    }
}

export function isFocusableFormField(element: HTMLElement): boolean {
    const matches: (str: string) => boolean =
        Element.prototype.matches || (Element as any).prototype.msMatchesSelector;

    const isFocusable = matches.call(element, Constants.INPUT_SELECTOR);
    const isNotFocusable = matches.call(element, Constants.FOCUSABLE_EXCLUDE);
    const isElementVisible = isVisible(element);

    const focusable = isFocusable && !isNotFocusable && isElementVisible;

    return focusable;
}

export function setDisplayed(element: HTMLElement, displayed: boolean) {
    element.classList.toggle('ag-hidden', !displayed);
}

export function setVisible(element: HTMLElement, visible: boolean) {
    element.classList.toggle('ag-invisible', !visible);
}

export function setDisabled(element: HTMLElement, disabled: boolean) {
    const attributeName = 'disabled';
    const addOrRemoveDisabledAttribute = disabled ?
        (e: HTMLElement) => e.setAttribute(attributeName, '') :
        (e: HTMLElement) => e.removeAttribute(attributeName);

    addOrRemoveDisabledAttribute(element);

    nodeListForEach(element.querySelectorAll('input'), input => addOrRemoveDisabledAttribute(input));
}

export function isElementChildOfClass(
    element: HTMLElement | null,
    cls: string,
    maxNest?: HTMLElement | number
): boolean {
    let counter = 0;

    while (element) {
        if (element.classList.contains(cls)) {
            return true;
        }

        element = element.parentElement;

        if (typeof maxNest == 'number') {
            if (++counter > maxNest) { break; }
        } else if (element === maxNest) { break; }
    }

    return false;
}

// returns back sizes as doubles instead of strings. similar to
// getBoundingClientRect, however getBoundingClientRect does not:
// a) work with fractions (eg browser is zooming)
// b) has CSS transitions applied (eg CSS scale, browser zoom), which we don't want, we want the un-transitioned values
export function getElementSize(el: HTMLElement): {
    height: number,
    width: number,
    paddingTop: number,
    paddingRight: number,
    paddingBottom: number,
    paddingLeft: number,
    marginTop: number,
    marginRight: number,
    marginBottom: number,
    marginLeft: number,
    boxSizing: string;
} {
    const {
        height,
        width,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        boxSizing
    } = window.getComputedStyle(el);

    return {
        height: parseFloat(height!),
        width: parseFloat(width!),
        paddingTop: parseFloat(paddingTop!),
        paddingRight: parseFloat(paddingRight!),
        paddingBottom: parseFloat(paddingBottom!),
        paddingLeft: parseFloat(paddingLeft!),
        marginTop: parseFloat(marginTop!),
        marginRight: parseFloat(marginRight!),
        marginBottom: parseFloat(marginBottom!),
        marginLeft: parseFloat(marginLeft!),
        boxSizing
    };
}

export function getInnerHeight(el: HTMLElement): number {
    const size = getElementSize(el);

    if (size.boxSizing === 'border-box') {
        return size.height - size.paddingTop - size.paddingBottom;
    }

    return size.height;
}

export function getInnerWidth(el: HTMLElement): number {
    const size = getElementSize(el);

    if (size.boxSizing === 'border-box') {
        return size.width - size.paddingLeft - size.paddingRight;
    }

    return size.width;
}

export function getAbsoluteHeight(el: HTMLElement): number {
    const size = getElementSize(el);
    const marginRight = size.marginBottom + size.marginTop;

    return Math.ceil(el.offsetHeight + marginRight);
}

export function getAbsoluteWidth(el: HTMLElement): number {
    const size = getElementSize(el);
    const marginWidth = size.marginLeft + size.marginRight;

    return Math.ceil(el.offsetWidth + marginWidth);
}

export function isRtlNegativeScroll(): boolean {
    if (typeof rtlNegativeScroll === "boolean") {
        return rtlNegativeScroll;
    }

    const template = document.createElement('div');
    template.style.direction = 'rtl';
    template.style.width = '1px';
    template.style.height = '1px';
    template.style.position = 'fixed';
    template.style.top = '0px';
    template.style.overflow = 'hidden';
    template.dir = 'rtl';
    template.innerHTML = /* html */
        `<div style="width: 2px">
            <span style="display: inline-block; width: 1px"></span>
            <span style="display: inline-block; width: 1px"></span>
        </div>`;

    document.body.appendChild(template);

    template.scrollLeft = 1;
    rtlNegativeScroll = Math.floor(template.scrollLeft) === 0;
    document.body.removeChild(template);

    return rtlNegativeScroll;
}

export function getScrollLeft(element: HTMLElement, rtl: boolean): number {
    let scrollLeft = element.scrollLeft;

    if (rtl) {
        // Absolute value - for FF that reports RTL scrolls in negative numbers
        scrollLeft = Math.abs(scrollLeft);

        if (isBrowserChrome() && !isRtlNegativeScroll()) {
            scrollLeft = element.scrollWidth - element.clientWidth - scrollLeft;
        }
    }

    return scrollLeft;
}

export function setScrollLeft(element: HTMLElement, value: number, rtl: boolean): void {
    if (rtl) {
        // Chrome and Safari when doing RTL have the END position of the scroll as zero, not the start
        if (isRtlNegativeScroll()) {
            value *= -1;
        } else if (isBrowserSafari() || isBrowserChrome()) {
            value = element.scrollWidth - element.clientWidth - value;
        }
    }
    element.scrollLeft = value;
}

export function clearElement(el: HTMLElement): void {
    while (el && el.firstChild) { el.removeChild(el.firstChild); }
}

/** @deprecated */
export function removeElement(parent: HTMLElement, cssSelector: string) {
    removeFromParent(parent.querySelector(cssSelector));
}

export function removeFromParent(node: Element | null) {
    if (node && node.parentNode) {
        node.parentNode.removeChild(node);
    }
}

export function isVisible(element: HTMLElement) {
    return element.offsetParent !== null;
}

/**
 * Loads the template and returns it as an element. makes up for no simple way in
 * the dom api to load html directly, eg we cannot do this: document.createElement(template)
 * @param {string} template
 * @returns {HTMLElement}
 */
export function loadTemplate(template: string): HTMLElement {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = (template || '').trim();

    return tempDiv.firstChild as HTMLElement;
}

export function appendHtml(eContainer: HTMLElement, htmlTemplate: string) {
    if (eContainer.lastChild) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
        // we put the items at the start, so new items appear underneath old items,
        // so when expanding/collapsing groups, the new rows don't go on top of the
        // rows below that are moving our of the way
        eContainer.insertAdjacentHTML('afterbegin', htmlTemplate);
    } else {
        eContainer.innerHTML = htmlTemplate;
    }
}

/** @deprecated */
export function getElementAttribute(element: any, attributeName: string): string | null {
    if (element.attributes && element.attributes[attributeName]) {
        const attribute = element.attributes[attributeName];

        return attribute.value;
    }

    return null;
}

export function offsetHeight(element: HTMLElement) {
    return element && element.clientHeight ? element.clientHeight : 0;
}

export function offsetWidth(element: HTMLElement) {
    return element && element.clientWidth ? element.clientWidth : 0;
}

export function ensureDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore?: HTMLElement | null): void {
    // if already in right order, do nothing
    if (eChildBefore && eChildBefore.nextSibling === eChild) {
        return;
    }

    const focusedEl = document.activeElement as HTMLElement;
    const eChildHasFocus = eChild.contains(focusedEl);

    if (eChildBefore) {
        if (eChildBefore.nextSibling) {
            // insert between the eRowBefore and the row after it
            eContainer.insertBefore(eChild, eChildBefore.nextSibling);
        } else {
            // if nextSibling is missing, means other row is at end, so just append new row at the end
            eContainer.appendChild(eChild);
        }
    } else {
        // otherwise put at start
        if (eContainer.firstChild && eContainer.firstChild !== eChild) {
            // insert it at the first location
            eContainer.insertAdjacentElement('afterbegin', eChild);
        }
    }

    if (eChildHasFocus && focusedEl && browserSupportsPreventScroll()) {
        focusedEl.focus({ preventScroll: true });
    }
}

export function setDomChildOrder(eContainer: HTMLElement, orderedChildren: (HTMLElement | null)[]): void {
    for (let i = 0; i < orderedChildren.length; i++) {
        const correctCellAtIndex = orderedChildren[i];
        const actualCellAtIndex = eContainer.children[i];

        if (actualCellAtIndex !== correctCellAtIndex) {
            eContainer.insertBefore(correctCellAtIndex!, actualCellAtIndex);
        }
    }
}

export function insertWithDomOrder(
    eContainer: HTMLElement,
    eToInsert: HTMLElement,
    eChildBefore: HTMLElement | null
): void {
    if (eChildBefore) {
        // if previous element exists, just slot in after the previous element
        eChildBefore.insertAdjacentElement('afterend', eToInsert);
    } else {
        if (eContainer.firstChild) {
            // insert it at the first location
            eContainer.insertAdjacentElement('afterbegin', eToInsert);
        } else {
            // otherwise eContainer is empty, so just append it
            eContainer.appendChild(eToInsert);
        }
    }
}

/** @deprecated */
export function prependDC(parent: HTMLElement, documentFragment: DocumentFragment): void {
    if (exists(parent.firstChild)) {
        parent.insertBefore(documentFragment, parent.firstChild);
    } else {
        parent.appendChild(documentFragment);
    }
}

export function addStylesToElement(eElement: any, styles: any) {
    if (!styles) { return; }

    Object.keys(styles).forEach((key) => {
        const keyCamelCase = hyphenToCamelCase(key);
        if (keyCamelCase) {
            eElement.style[keyCamelCase] = styles[key];
        }
    });
}

export function isHorizontalScrollShowing(element: HTMLElement): boolean {
    return element.clientWidth < element.scrollWidth;
}

export function isVerticalScrollShowing(element: HTMLElement): boolean {
    return element.clientHeight < element.scrollHeight;
}

export function setElementWidth(element: HTMLElement, width: string | number) {
    if (width === 'flex') {
        element.style.removeProperty('width');
        element.style.removeProperty('minWidth');
        element.style.removeProperty('maxWidth');
        element.style.flex = '1 1 auto';
    } else {
        setFixedWidth(element, width);
    }
}

export function setFixedWidth(element: HTMLElement, width: string | number) {
    width = formatSize(width);
    element.style.width = width.toString();
    element.style.maxWidth = width.toString();
    element.style.minWidth = width.toString();
}

export function setElementHeight(element: HTMLElement, height: string | number) {
    if (height === 'flex') {
        element.style.removeProperty('height');
        element.style.removeProperty('minHeight');
        element.style.removeProperty('maxHeight');
        element.style.flex = '1 1 auto';
    } else {
        setFixedHeight(element, height);
    }
}

export function setFixedHeight(element: HTMLElement, height: string | number) {
    height = formatSize(height);
    element.style.height = height.toString();
    element.style.maxHeight = height.toString();
    element.style.minHeight = height.toString();
}

export function formatSize(size: number | string) {
    if (typeof size === 'number') {
        return `${size}px`;
    }

    return size;
}

/**
 * Returns true if it is a DOM node
 * taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
 * @param {any} o
 * @return {boolean}
 */
export function isNode(o: any): boolean {
    return (
        typeof Node === 'function'
            ? o instanceof Node
            : o && typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName === 'string'
    );
}

//
/**
 * Returns true if it is a DOM element
 * taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
 * @param {any} o
 * @returns {boolean}
 */
export function isElement(o: any): boolean {
    return (
        typeof HTMLElement === 'function'
            ? o instanceof HTMLElement //DOM2
            : o && isNonNullObject(o) && o.nodeType === 1 && typeof o.nodeName === 'string'
    );
}

export function isNodeOrElement(o: any) {
    return isNode(o) || isElement(o);
}

/**
 * Makes a copy of a node list into a list
 * @param {NodeList} nodeList
 * @returns {Node[]}
 */
export function copyNodeList(nodeList: NodeListOf<Node> | null): Node[] {
    if (nodeList == null) { return []; }

    const result: Node[] = [];

    nodeListForEach(nodeList, node => result.push(node));

    return result;
}

export function iterateNamedNodeMap(map: NamedNodeMap, callback: (key: string, value: string) => void): void {
    if (!map) { return; }

    for (let i = 0; i < map.length; i++) {
        const attr = map[i];
        callback(attr.name, attr.value);
    }
}

/** @deprecated */
export function setCheckboxState(eCheckbox: HTMLInputElement, state: any) {
    if (typeof state === 'boolean') {
        eCheckbox.checked = state;
        eCheckbox.indeterminate = false;
    } else {
        // isNodeSelected returns back undefined if it's a group and the children
        // are a mix of selected and unselected
        eCheckbox.indeterminate = true;
    }
}

export function addOrRemoveAttribute(element: HTMLElement, name: string, value: any) {
    if (value == null) {
        element.removeAttribute(name);
    } else {
        element.setAttribute(name, value.toString());
    }
}

export function nodeListForEach<T extends Node>(nodeList: NodeListOf<T> | null, action: (value: T) => void): void {
    if (nodeList == null) { return; }

    for (let i = 0; i < nodeList.length; i++) {
        action(nodeList[i]);
    }
}
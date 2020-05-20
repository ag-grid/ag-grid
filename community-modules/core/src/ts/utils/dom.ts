import { isBrowserChrome, isBrowserSafari, isBrowserFirefox } from './browser';
import { exists } from './generic';
import { hyphenToCamelCase } from './string';

export function addCssClass(element: HTMLElement, className: string) {
    if (!className || className.length === 0) { return; }

    if (className.indexOf(' ') >= 0) {
        className.split(' ').forEach(value => addCssClass(element, value));
        return;
    }

    if (element.classList) {
        element.classList.add(className);
    } else if (element.className && element.className.length > 0) {
        const cssClasses = element.className.split(' ');

        if (cssClasses.indexOf(className) < 0) {
            cssClasses.push(className);
            element.setAttribute('class', cssClasses.join(' '));
        }
    } else {
        // do not use element.classList = className here, it will cause
        // a read-only assignment error on some browsers (IE/Edge).
        element.setAttribute('class', className);
    }

    return element;
}

export function removeCssClass(element: HTMLElement, className: string) {
    if (element.classList) {
        element.classList.remove(className);
    } else if (element.className && element.className.length > 0) {
        const newClassName = element.className.split(' ').filter(c => c !== className).join(' ');

        element.setAttribute('class', newClassName);
    }
}

export function addOrRemoveCssClass(element: HTMLElement, className: string, addOrRemove: boolean) {
    if (addOrRemove) {
        addCssClass(element, className);
    } else {
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
export function radioCssClass(element: HTMLElement, elementClass: string | null, otherElementClass?: string | null) {
    const parent = element.parentElement;
    let sibling = parent.firstChild as HTMLElement;

    while (sibling) {
        if (elementClass) {
            addOrRemoveCssClass(sibling, elementClass, sibling === element);
        }
        if (otherElementClass) {
            addOrRemoveCssClass(sibling, otherElementClass, sibling !== element);
        }
        sibling = sibling.nextSibling as HTMLElement;
    }
}

export function containsClass(element: HTMLElement, className: string): boolean {
    if (element.classList) {
        // for modern browsers
        return element.classList.contains(className);
    }

    if (element.className) {
        // for older browsers, check against the string of class names
        // if only one class, can check for exact match
        const onlyClass = element.className === className;
        // if many classes, check for class name, we have to pad with ' ' to stop other
        // class names that are a substring of this class
        const contains = element.className.indexOf(' ' + className + ' ') >= 0;
        // the padding above then breaks when it's the first or last class names
        const startsWithClass = element.className.indexOf(className + ' ') === 0;
        const endsWithClass = element.className.lastIndexOf(' ' + className) === (element.className.length - className.length - 1);

        return onlyClass || contains || startsWithClass || endsWithClass;
    }

    // if item is not a node
    return false;
}

export function setDisplayed(element: HTMLElement, displayed: boolean) {
    addOrRemoveCssClass(element, 'ag-hidden', !displayed);
}

export function setVisible(element: HTMLElement, visible: boolean) {
    addOrRemoveCssClass(element, 'ag-invisible', !visible);
}

export function setDisabled(element: HTMLElement, disabled: boolean) {
    const attributeName = 'disabled';

    if (disabled) {
        element.setAttribute(attributeName, '');
    } else {
        element.removeAttribute(attributeName);
    }

    addOrRemoveCssClass(element, 'ag-disabled', disabled);
}

export function isElementChildOfClass(element: HTMLElement, cls: string, maxNest?: number): boolean {
    let counter = 0;

    while (element) {
        if (containsClass(element, cls)) {
            return true;
        }
        element = element.parentElement;
        if (maxNest && ++counter > maxNest) { break; }
    }

    return false;
}

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

export function getScrollLeft(element: HTMLElement, rtl: boolean): number {
    let scrollLeft = element.scrollLeft;

    if (rtl) {
        // Absolute value - for FF that reports RTL scrolls in negative numbers
        scrollLeft = Math.abs(scrollLeft);

        // Get Chrome to return the same value as well
        if (isBrowserChrome()) {
            scrollLeft = element.scrollWidth - element.clientWidth - scrollLeft;
        }
    }

    return scrollLeft;
}

export function setScrollLeft(element: HTMLElement, value: number, rtl: boolean): void {
    if (rtl) {
        // Chrome and Safari when doing RTL have the END position of the scroll as zero, not the start
        if (isBrowserSafari() || isBrowserChrome()) {
            value = element.scrollWidth - element.clientWidth - value;
        }
        // Firefox uses negative numbers when doing RTL scrolling
        if (isBrowserFirefox()) {
            value *= -1;
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

export function ensureDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore: HTMLElement): void {
    // if already in right order, do nothing
    if (eChildBefore && eChildBefore.nextSibling === eChild) {
        return;
    }

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
}

export function setDomChildOrder(eContainer: HTMLElement, orderedChildren: HTMLElement[]): void {
    for (let i = 0; i < orderedChildren.length; i++) {
        const correctCellAtIndex = orderedChildren[i];
        const actualCellAtIndex = eContainer.children[i];

        if (actualCellAtIndex !== correctCellAtIndex) {
            eContainer.insertBefore(correctCellAtIndex, actualCellAtIndex);
        }
    }
}

export function insertTemplateWithDomOrder(
    eContainer: HTMLElement,
    htmlTemplate: string,
    eChildBefore: HTMLElement
): HTMLElement {
    let res: HTMLElement;

    if (eChildBefore) {
        // if previous element exists, just slot in after the previous element
        eChildBefore.insertAdjacentHTML('afterend', htmlTemplate);
        res = eChildBefore.nextSibling as HTMLElement;
    } else {
        if (eContainer.firstChild) {
            // insert it at the first location
            eContainer.insertAdjacentHTML('afterbegin', htmlTemplate);
        } else {
            // otherwise eContainer is empty, so just append it
            eContainer.innerHTML = htmlTemplate;
        }
        res = eContainer.firstChild as HTMLElement;
    }
    return res;
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
        element.style.width = null;
        element.style.minWidth = null;
        element.style.maxWidth = null;
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
        element.style.height = null;
        element.style.minHeight = null;
        element.style.maxHeight = null;
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
            : o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
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
export function copyNodeList(nodeList: NodeList): Node[] {
    const childCount = nodeList ? nodeList.length : 0;
    const res: Node[] = [];

    for (let i = 0; i < childCount; i++) {
        res.push(nodeList[i]);
    }

    return res;
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

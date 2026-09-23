import type { UtilBeanCollection } from '../interfaces/agCoreBeanCollection';
import { _setAriaHidden } from './aria';
import { _last } from './array';
import { _getDocument, _getWindow } from './document';

/**
 * This method adds a class to an element and remove that class from all siblings.
 * Useful for toggling state.
 * @param {HTMLElement} element The element to receive the class
 * @param {string} elementClass The class to be assigned to the element
 * @param {boolean} otherElementClass The class to be assigned to siblings of the element, but not the element itself
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _radioCssClass(element: HTMLElement, elementClass: string | null, otherElementClass?: string | null) {
    const parent = element.parentElement;
    let sibling = parent && (parent.firstChild as HTMLElement);

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

export const FOCUSABLE_SELECTOR = '[tabindex], input, select, button, textarea, [href]';
// ag-hidden subtrees are excluded even where CSS keeps them visible (e.g. a tool panel animating closed)
export const FOCUSABLE_EXCLUDE = '[disabled], .ag-disabled:not(.ag-button), .ag-disabled *, .ag-hidden, .ag-hidden *';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isFocusableFormField(element: Element | null): boolean {
    if (!element) {
        return false;
    }
    const isFocusable = element.matches('input, select, button, textarea');
    if (!isFocusable) {
        return false;
    }
    const isNotFocusable = element.matches(FOCUSABLE_EXCLUDE);
    if (isNotFocusable) {
        return false;
    }
    return _isVisible(element);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setDisplayed(element: Element, displayed: boolean, options: { skipAriaHidden?: boolean } = {}) {
    const { skipAriaHidden } = options;
    element.classList.toggle('ag-hidden', !displayed);
    if (!skipAriaHidden) {
        _setAriaHidden(element, !displayed);
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setVisible(element: HTMLElement, visible: boolean, options: { skipAriaHidden?: boolean } = {}) {
    const { skipAriaHidden } = options;
    element.classList.toggle('ag-invisible', !visible);
    if (!skipAriaHidden) {
        _setAriaHidden(element, !visible);
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setDisabled(element: HTMLElement, disabled: boolean) {
    const attributeName = 'disabled';
    const addOrRemoveDisabledAttribute = disabled
        ? (e: HTMLElement) => e.setAttribute(attributeName, '')
        : (e: HTMLElement) => e.removeAttribute(attributeName);

    addOrRemoveDisabledAttribute(element);

    const inputs = element.querySelectorAll('input') ?? [];
    for (const input of inputs) {
        addOrRemoveDisabledAttribute(input as HTMLElement);
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isElementChildOfClass(
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
            if (++counter > maxNest) {
                break;
            }
        } else if (element === maxNest) {
            break;
        }
    }

    return false;
}

/** A computed box metric can be `''` or a keyword like `initial`; both must read as zero, not NaN. */
const pf = (value: string): number => Number.parseFloat(value) || 0;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *  Pass `style` to share one `getComputedStyle` call across both axes of `el`; the declaration stays
 *  live, so a read after a layout write sees the new value rather than a snapshot. */
export function _getInnerHeight(el: HTMLElement, style: CSSStyleDeclaration = window.getComputedStyle(el)): number {
    const height = pf(style.height);

    if (style.boxSizing === 'border-box') {
        return (
            height -
            pf(style.paddingTop) -
            pf(style.paddingBottom) -
            pf(style.borderTopWidth) -
            pf(style.borderBottomWidth)
        );
    }

    return height;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *  `style` as above — one `getComputedStyle` for both axes. */
export function _getInnerWidth(el: HTMLElement, style: CSSStyleDeclaration = window.getComputedStyle(el)): number {
    const width = pf(style.width);

    if (style.boxSizing === 'border-box') {
        return (
            width -
            pf(style.paddingLeft) -
            pf(style.paddingRight) -
            pf(style.borderLeftWidth) -
            pf(style.borderRightWidth)
        );
    }

    return width;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *  The height an auto-height measurement has to add back to a wrapper's `offsetHeight`. */
export function _getVerticalPaddingAndBorder(el: HTMLElement): number {
    const style = window.getComputedStyle(el);

    return pf(style.paddingTop) + pf(style.paddingBottom) + pf(style.borderTopWidth) + pf(style.borderBottomWidth);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getAbsoluteHeight(el: HTMLElement): number {
    const style = window.getComputedStyle(el);

    return Math.floor(pf(style.height) + pf(style.marginBottom) + pf(style.marginTop));
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getAbsoluteWidth(el: HTMLElement): number {
    const style = window.getComputedStyle(el);

    return Math.floor(pf(style.width) + pf(style.marginLeft) + pf(style.marginRight));
}

export function _getElementRectWithOffset(el: HTMLElement): {
    top: number;
    left: number;
    right: number;
    bottom: number;
} {
    const offsetElementRect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);

    return {
        top: offsetElementRect.top + pf(style.borderTopWidth),
        left: offsetElementRect.left + pf(style.borderLeftWidth),
        right: offsetElementRect.right + pf(style.borderRightWidth),
        bottom: offsetElementRect.bottom + pf(style.borderBottomWidth),
    };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getScrollLeft(element: HTMLElement, rtl: boolean): number {
    let scrollLeft = element.scrollLeft;

    if (rtl) {
        scrollLeft = Math.abs(scrollLeft);
    }

    return scrollLeft;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setScrollLeft(element: HTMLElement, value: number, rtl: boolean): void {
    if (rtl) {
        value *= -1;
    }
    element.scrollLeft = value;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _clearElement(el: HTMLElement | null | undefined): void {
    while (el?.firstChild) {
        el.firstChild.remove();
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _removeFromParent(node: Element | null | undefined): void {
    if (node?.parentNode) {
        node.remove();
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isInDOM(element: Element): element is HTMLElement {
    return !!(element as HTMLElement).offsetParent;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isVisible(element: Element) {
    if (element.checkVisibility) {
        return element.checkVisibility({ checkVisibilityCSS: true });
    }
    const isHidden = !_isInDOM(element) || window.getComputedStyle(element).visibility !== 'visible';
    return !isHidden;
}

/**
 * Loads the template and returns it as an element.
 * NOTE: Prefer _createElement
 * @param {string} template
 * @returns {HTMLElement}
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _loadTemplate(template: string | undefined | null): HTMLElement {
    const tempDiv = document.createElement('div');
    // eslint-disable-next-line no-restricted-properties -- no other way to parse custom HTML strings from the user
    tempDiv.innerHTML = (template || '').trim();

    return tempDiv.firstChild as HTMLElement;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _ensureDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore?: HTMLElement | null): void {
    // if already in right order, do nothing
    if (eChildBefore?.nextSibling === eChild) {
        return;
    }

    if (!eContainer.firstChild) {
        eContainer.appendChild(eChild);
    } else if (eChildBefore) {
        if (eChildBefore.nextSibling) {
            // insert between the eRowBefore and the row after it
            eContainer.insertBefore(eChild, eChildBefore.nextSibling);
        } else {
            // if nextSibling is missing, means other row is at end, so just append new row at the end
            eContainer.appendChild(eChild);
        }
    } else if (eContainer.firstChild && eContainer.firstChild !== eChild) {
        // otherwise put at start
        // insert it at the first location
        eContainer.prepend(eChild);
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setDomChildOrder(eContainer: HTMLElement, orderedChildren: (HTMLElement | null)[]): void {
    for (let i = 0; i < orderedChildren.length; i++) {
        const correctCellAtIndex = orderedChildren[i];
        const actualCellAtIndex = eContainer.children[i];

        if (actualCellAtIndex !== correctCellAtIndex) {
            eContainer.insertBefore(correctCellAtIndex!, actualCellAtIndex);
        }
    }
}

/**
 * Converts a camelCase string into hyphenated string
 * @param {string} camelCase
 * @returns {string}
 */
function _camelCaseToHyphenated(camelCase: string): string {
    return camelCase.replace(/[A-Z]/g, (s) => `-${s.toLocaleLowerCase()}`);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _addStylesToElement(
    eElement: any,
    styles:
        | {
              [cssProperty: string]: string | number;
          }
        | null
        | undefined
) {
    if (!styles) {
        return;
    }

    for (const key of Object.keys(styles)) {
        const value = styles[key];
        if (!key?.length || value == null) {
            continue;
        }

        // changes the key from camelCase into a hyphenated-string
        const parsedKey = _camelCaseToHyphenated(key);
        const valueAsString = value.toString();
        const parsedValue = valueAsString.replace(/\s*!important/g, '');
        const priority = parsedValue.length != valueAsString.length ? 'important' : undefined;

        eElement.style.setProperty(parsedKey, parsedValue, priority);
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isElementOverflowingCallback(getElement: () => HTMLElement | undefined): () => boolean {
    return () => {
        const element = getElement();
        if (!element) {
            // defaults to true
            return true;
        }
        return _isHorizontalScrollShowing(element) || _isVerticalScrollShowing(element);
    };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isHorizontalScrollShowing(element: HTMLElement): boolean {
    return element.clientWidth < element.scrollWidth;
}

function _isVerticalScrollShowing(element: HTMLElement): boolean {
    return element.clientHeight < element.scrollHeight;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setElementWidth(element: HTMLElement, width: string | number) {
    if (width === 'flex') {
        element.style.removeProperty('width');
        element.style.removeProperty('minWidth');
        element.style.removeProperty('maxWidth');
        element.style.flex = '1 1 auto';
    } else {
        _setFixedWidth(element, width);
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setFixedWidth(element: HTMLElement, width: string | number) {
    width = _formatSize(width);
    element.style.width = width;
    element.style.maxWidth = width;
    element.style.minWidth = width;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setFixedHeight(element: HTMLElement, height: string | number) {
    height = _formatSize(height);
    element.style.height = height;
    element.style.maxHeight = height;
    element.style.minHeight = height;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _formatSize(size: number | string) {
    return typeof size === 'number' ? `${size}px` : size;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isNodeOrElement(o: any): o is Node | Element {
    return o instanceof Node || o instanceof HTMLElement;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _addOrRemoveAttribute(element: HTMLElement, name: string, value: string | number | null | undefined) {
    if (value == null || value === '') {
        element.removeAttribute(name);
    } else {
        element.setAttribute(name, value.toString());
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _placeCaretAtEnd(beans: UtilBeanCollection, contentElement: HTMLElement): void {
    if (!contentElement.isContentEditable) {
        return;
    }
    const selection = _getWindow(beans).getSelection();

    if (!selection) {
        return;
    }

    const range = _getDocument(beans).createRange();
    range.selectNodeContents(contentElement);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _observeResize(
    beans: UtilBeanCollection,
    element: HTMLElement,
    callback: ResizeObserverCallback
): () => void {
    const win = _getWindow(beans);
    const ResizeObserverImpl = win.ResizeObserver;
    const resizeObserver = ResizeObserverImpl ? new ResizeObserverImpl(callback) : null;
    resizeObserver?.observe(element);
    return () => resizeObserver?.disconnect();
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _observeIntersection(
    beans: UtilBeanCollection,
    element: HTMLElement,
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
): () => void {
    const win = _getWindow(beans);
    const IntersectionObserver = win.IntersectionObserver;
    // support envs that don't have IntersectionObserver
    const intersectionObserver = IntersectionObserver
        ? new IntersectionObserver((entries) => {
              // use _last because when an element rapidly enters then leaves the screen
              // one callback might return multiple entries for the same element
              callback(_last(entries));
          }, options)
        : null;
    intersectionObserver?.observe(element);
    return () => intersectionObserver?.disconnect();
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _requestAnimationFrame(beans: UtilBeanCollection, callback: any) {
    const win = _getWindow(beans);

    if (win.requestAnimationFrame) {
        win.requestAnimationFrame(callback);
    } else if ((win as any).webkitRequestAnimationFrame) {
        (win as any).webkitRequestAnimationFrame(callback);
    } else {
        win.setTimeout(callback, 0);
    }
}

type Attributes = { [key: string]: string };
type TagName<SelectorType extends string> = keyof HTMLElementTagNameMap | Lowercase<SelectorType>;
/** Type to help avoid typos, add new roles as required. */
type RoleType =
    | 'button'
    | 'columnheader'
    | 'gridcell'
    | 'heading'
    | 'listbox'
    | 'menu'
    | 'option'
    | 'presentation'
    | 'group'
    | 'row'
    | 'rowgroup'
    | 'status'
    | 'tab'
    | 'tablist'
    | 'tabpanel'
    | 'toolbar'
    | 'treeitem';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type AgElementParams<SelectorType extends string> = {
    /** The tag name to use for the element, either browser tag or one of the AG Grid components such as ag-checkbox
     */
    tag: TagName<SelectorType>;
    /** AG Grid data-ref attribute, should match a property on the class that uses the same name and is initialised with RefPlaceholder
     * @example
     * ref: 'eLabel'
     * private eLabel: HTMLElement = RefPlaceholder;
     */
    ref?: string;
    /**
     * Should be a single string of space-separated class names
     * @example
     * cls: 'ag-header-cell ag-header-cell-sortable'
     */
    cls?: string;

    /** The role attribute to add to the dom element */
    role?: RoleType;

    /** Key Value pair of attributes to add to the dom element via `element.setAttribute(key,value)` */
    attrs?: Attributes;

    /**
     * A single string can be passed to the children property and this will call `element.textContent = children` on the element.
     *
     * Otherwise an array of children is passed.
     * A child element can be an ElementParams / string / (() => Element) / null/undefined.
     *  - If an ElementParams is passed it will be created and appended to the parent element. It will be wrapped with whitespace to mimic the previous behaviour of multi line strings.
     *  - If a string is passed it will be appended as a text node.
     *  - If a function is passed, it will be called and the result appended
     *  - If null or undefined is passed it will be ignored.
     */
    children?: (AgElementParams<SelectorType> | string | (() => Element) | null | undefined)[] | string;
};

/** AG Grid attribute used to automatically assign DOM Elements to class properties */
export const DataRefAttribute = 'data-ref';

let whitespaceNode: Node | null;
function getWhitespaceNode() {
    // Cloning is slightly faster than creating a new node each time
    whitespaceNode ??= document.createTextNode(' ');
    return whitespaceNode.cloneNode();
}
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _createAgElement<T extends HTMLElement = HTMLElement, TComponentSelector extends string = string>(
    params: AgElementParams<TComponentSelector>
): T {
    const { attrs, children, cls, ref, role, tag } = params;
    const element = document.createElement(tag);

    if (cls) {
        element.className = cls;
    }
    if (ref) {
        element.setAttribute(DataRefAttribute, ref);
    }
    if (role) {
        element.setAttribute('role', role);
    }

    if (attrs) {
        for (const key of Object.keys(attrs)) {
            element.setAttribute(key, attrs[key]);
        }
    }

    if (children) {
        if (typeof children === 'string') {
            element.textContent = children;
        } else {
            let addFirstWhitespace = true;
            for (const child of children) {
                if (child) {
                    if (typeof child === 'string') {
                        element.appendChild(document.createTextNode(child));
                        addFirstWhitespace = false;
                    } else if (typeof child === 'function') {
                        element.appendChild(child());
                    } else {
                        // NOTE: To match the previous behaviour of when component templates where defined on multi line strings we need
                        // to add a whitespace node before and after each child element.
                        // Ideally we would not do this but this reduces the chance of breaking changes.
                        if (addFirstWhitespace) {
                            element.appendChild(getWhitespaceNode());
                            addFirstWhitespace = false;
                        }
                        element.append(_createAgElement(child));
                        element.appendChild(getWhitespaceNode());
                    }
                }
            }
        }
    }
    return element as T;
}

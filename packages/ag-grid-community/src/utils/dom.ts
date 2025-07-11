import { _getRootNode } from '../agStack/utils/beanUtils';
import { _isBrowserSafari } from '../agStack/utils/browserUtils';
import type { AgElementParams } from '../agStack/utils/domUtils';
import { _createAgElement, _formatSize, _getElementSize, _isVisible } from '../agStack/utils/domUtils';
import type { BeanCollection } from '../context/context';
import type { CellStyle, HeaderStyle } from '../entities/colDef';
import type { RowStyle } from '../entities/gridOptions';
import { _getWindow } from '../gridOptionsUtils';
import type { AgComponentSelectorType } from '../widgets/component';
import { _isBrowserFirefox } from './browser';

/**
 * This method adds a class to an element and remove that class from all siblings.
 * Useful for toggling state.
 * @param {HTMLElement} element The element to receive the class
 * @param {string} elementClass The class to be assigned to the element
 * @param {boolean} otherElementClass The class to be assigned to siblings of the element, but not the element itself
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
export const FOCUSABLE_EXCLUDE = '[disabled], .ag-disabled:not(.ag-button), .ag-disabled *';

export function _isFocusableFormField(element: HTMLElement): boolean {
    const matches: (str: string) => boolean = Element.prototype.matches || (Element as any).prototype.msMatchesSelector;

    const inputSelector = 'input, select, button, textarea';
    const isFocusable = matches.call(element, inputSelector);
    const isNotFocusable = matches.call(element, FOCUSABLE_EXCLUDE);
    const isElementVisible = _isVisible(element);

    const focusable = isFocusable && !isNotFocusable && isElementVisible;

    return focusable;
}

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

export function _getInnerWidth(el: HTMLElement): number {
    const size = _getElementSize(el);

    if (size.boxSizing === 'border-box') {
        return size.width - size.paddingLeft - size.paddingRight;
    }

    return size.width;
}

export function _getAbsoluteHeight(el: HTMLElement): number {
    const { height, marginBottom, marginTop } = _getElementSize(el);

    return Math.floor(height + marginBottom + marginTop);
}

export function _getElementRectWithOffset(el: HTMLElement): {
    top: number;
    left: number;
    right: number;
    bottom: number;
} {
    const offsetElementRect = el.getBoundingClientRect();
    const { borderTopWidth, borderLeftWidth, borderRightWidth, borderBottomWidth } = _getElementSize(el);

    return {
        top: offsetElementRect.top + (borderTopWidth || 0),
        left: offsetElementRect.left + (borderLeftWidth || 0),
        right: offsetElementRect.right + (borderRightWidth || 0),
        bottom: offsetElementRect.bottom + (borderBottomWidth || 0),
    };
}

export function _getScrollLeft(element: HTMLElement, rtl: boolean): number {
    let scrollLeft = element.scrollLeft;

    if (rtl) {
        scrollLeft = Math.abs(scrollLeft);
    }

    return scrollLeft;
}

export function _setScrollLeft(element: HTMLElement, value: number, rtl: boolean): void {
    if (rtl) {
        value *= -1;
    }
    element.scrollLeft = value;
}

export function _ensureDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore?: HTMLElement | null): void {
    // if already in right order, do nothing
    if (eChildBefore && eChildBefore.nextSibling === eChild) {
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
        eContainer.insertAdjacentElement('afterbegin', eChild);
    }
}

export function _setDomChildOrder(eContainer: HTMLElement, orderedChildren: (HTMLElement | null)[]): void {
    for (let i = 0; i < orderedChildren.length; i++) {
        const correctCellAtIndex = orderedChildren[i];
        const actualCellAtIndex = eContainer.children[i];

        if (actualCellAtIndex !== correctCellAtIndex) {
            eContainer.insertBefore(correctCellAtIndex!, actualCellAtIndex);
        }
    }
}

export function _insertWithDomOrder(
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

/**
 * Converts a camelCase string into hyphenated string
 * @param {string} camelCase
 * @returns {string}
 */
function _camelCaseToHyphenated(camelCase: string): string {
    return camelCase.replace(/[A-Z]/g, (s) => `-${s.toLocaleLowerCase()}`);
}

export function _addStylesToElement(eElement: any, styles: RowStyle | CellStyle | HeaderStyle | null | undefined) {
    if (!styles) {
        return;
    }

    for (const key of Object.keys(styles)) {
        const value = styles[key];
        if (!key || !key.length || value == null) {
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

export function _setFixedHeight(element: HTMLElement, height: string | number) {
    height = _formatSize(height);
    element.style.height = height;
    element.style.maxHeight = height;
    element.style.minHeight = height;
}

export function _observeResize(
    beans: BeanCollection,
    element: HTMLElement,
    callback: ResizeObserverCallback
): () => void {
    const win = _getWindow(beans);
    const ResizeObserverImpl = win.ResizeObserver;
    const resizeObserver = ResizeObserverImpl ? new ResizeObserverImpl(callback) : null;
    resizeObserver?.observe(element);
    return () => resizeObserver?.disconnect();
}

function _getTextSelectionRanges(beans: BeanCollection): { selection: Selection | null; ranges: Range[] } {
    const rootNode = _getRootNode(beans);
    const selection = 'getSelection' in rootNode ? (rootNode.getSelection() as Selection) : null;
    const ranges: Range[] = [];

    for (let i = 0; i < (selection?.rangeCount ?? 0); i++) {
        const range = selection?.getRangeAt(i);

        if (range) {
            ranges.push(range);
        }
    }

    return { selection, ranges };
}

/**
 * FF and Safari remove text selections when the focus changes. This is inconsistent with Chrome, whose behaviour
 * we prefer in this case. This utility preserves whatever text selection exists before the given action is taken.
 */
export function _preserveRangesWhile(beans: BeanCollection, fn: () => void): void {
    const enableCellTextSelection = beans.gos.get('enableCellTextSelection');
    if (!enableCellTextSelection) {
        return fn();
    }

    if (!_isBrowserFirefox() && !_isBrowserSafari()) {
        return fn();
    }

    const { selection, ranges } = _getTextSelectionRanges(beans);

    fn();

    selection?.removeAllRanges();
    for (const range of ranges) {
        selection?.addRange(range);
    }
}

export function _requestAnimationFrame(beans: BeanCollection, callback: any) {
    const win = _getWindow(beans);

    if (win.requestAnimationFrame) {
        win.requestAnimationFrame(callback);
    } else if ((win as any).webkitRequestAnimationFrame) {
        (win as any).webkitRequestAnimationFrame(callback);
    } else {
        win.setTimeout(callback, 0);
    }
}

export type ElementParams = AgElementParams<AgComponentSelectorType>;

export function _createElement<T extends HTMLElement = HTMLElement>(
    params: AgElementParams<AgComponentSelectorType>
): T {
    return _createAgElement(params);
}

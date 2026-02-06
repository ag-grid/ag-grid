import type { UtilBeanCollection } from '../interfaces/agCoreBeanCollection';
import { _last } from './array';
import { _getTabIndex } from './browser';
import { _getActiveDomElement, _getDocument } from './document';
import { FOCUSABLE_EXCLUDE, FOCUSABLE_SELECTOR, _isVisible } from './dom';

let keyboardModeActive: boolean = false;
let instanceCount: number = 0;

function addKeyboardModeEvents(doc: Document): void {
    if (instanceCount > 0) {
        return;
    }
    doc.addEventListener('keydown', toggleKeyboardMode);
    doc.addEventListener('mousedown', toggleKeyboardMode);
}

function removeKeyboardModeEvents(doc: Document): void {
    if (instanceCount > 0) {
        return;
    }
    doc.removeEventListener('keydown', toggleKeyboardMode);
    doc.removeEventListener('mousedown', toggleKeyboardMode);
}

function toggleKeyboardMode(event: KeyboardEvent | MouseEvent | TouchEvent): void {
    const isKeyboardActive = keyboardModeActive;
    const isKeyboardEvent = event.type === 'keydown';

    if (isKeyboardEvent) {
        // the following keys should not toggle keyboard mode.
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }
    }

    if (isKeyboardActive === isKeyboardEvent) {
        return;
    }

    keyboardModeActive = isKeyboardEvent;
}

export function _registerKeyboardFocusEvents(beans: UtilBeanCollection): () => void {
    const eDocument = _getDocument(beans);
    addKeyboardModeEvents(eDocument);

    instanceCount++;
    return () => {
        instanceCount--;
        removeKeyboardModeEvents(eDocument);
    };
}

export function _isKeyboardMode(): boolean {
    return keyboardModeActive;
}

export function _findFocusableElements(
    rootNode: HTMLElement,
    exclude?: string | null,
    onlyUnmanaged = false
): HTMLElement[] {
    const focusableString = FOCUSABLE_SELECTOR;
    let excludeString = FOCUSABLE_EXCLUDE;

    if (exclude) {
        excludeString += ', ' + exclude;
    }

    if (onlyUnmanaged) {
        excludeString += ', [tabindex="-1"]';
    }

    const nodes = Array.prototype.slice
        .apply(rootNode.querySelectorAll(focusableString))
        .filter((node: HTMLElement) => {
            return _isVisible(node);
        }) as HTMLElement[];
    const excludeNodes = Array.prototype.slice.apply(rootNode.querySelectorAll(excludeString)) as HTMLElement[];

    if (!excludeNodes.length) {
        return nodes;
    }

    const diff = (a: HTMLElement[], b: HTMLElement[]) => a.filter((element) => b.indexOf(element) === -1);
    return diff(nodes, excludeNodes);
}

export function _focusInto(
    rootNode: HTMLElement,
    up = false,
    onlyUnmanaged = false,
    excludeTabGuards = false
): boolean {
    const focusableElements = _findFocusableElements(
        rootNode,
        excludeTabGuards ? '.ag-tab-guard' : null,
        onlyUnmanaged
    );
    const toFocus = up ? _last(focusableElements) : focusableElements[0];

    if (toFocus) {
        toFocus.focus({ preventScroll: true });
        return true;
    }

    return false;
}

export function _findNextFocusableElement(
    beans: UtilBeanCollection,
    rootNode: HTMLElement,
    onlyManaged?: boolean | null,
    backwards?: boolean
): HTMLElement | null {
    const focusable = _findFocusableElements(rootNode, onlyManaged ? ':not([tabindex="-1"])' : null);
    const activeEl = _getActiveDomElement(beans) as HTMLElement;
    let currentIndex: number;

    if (onlyManaged) {
        currentIndex = focusable.findIndex((el) => el.contains(activeEl));
    } else {
        currentIndex = focusable.indexOf(activeEl);
    }

    const nextIndex = currentIndex + (backwards ? -1 : 1);

    if (nextIndex < 0 || nextIndex >= focusable.length) {
        return null;
    }

    return focusable[nextIndex];
}

export function _findTabbableParent(node: HTMLElement | null, limit: number = 5): HTMLElement | null {
    let counter = 0;

    while (node && _getTabIndex(node) === null && ++counter <= limit) {
        node = node.parentElement;
    }

    if (_getTabIndex(node) === null) {
        return null;
    }

    return node;
}

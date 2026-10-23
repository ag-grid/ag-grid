import type { UtilBeanCollection } from '../interfaces/agCoreBeanCollection';
import { _exists } from './generic';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getRootNode(beans: UtilBeanCollection): Document | ShadowRoot {
    return beans.eRootDiv.getRootNode() as Document | ShadowRoot;
}

/**
 * The focused element in the grid's own tree or, while focus is outside it, in the nearest enclosing root holding it,
 * where a component stands as its host: what to test with `contains` against grid elements, which stops at a shadow boundary.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getActiveDomElement(beans: UtilBeanCollection): Element | null {
    let root: Node = _getRootNode(beans);
    let active = (root as Document | ShadowRoot).activeElement;
    let host = shadowHostOf(root);
    while (!active && host) {
        root = host.getRootNode();
        active = (root as Document | ShadowRoot).activeElement;
        host = shadowHostOf(root);
    }
    return active ?? null;
}

/**
 * The element that holds focus: `_getActiveDomElement` followed into each open shadow root a host stands for. What to
 * restore focus to or compare by identity; never a `contains` subject, as inside a component it is outside the grid's tree.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getDeepActiveElement(beans: UtilBeanCollection): Element | null {
    let active = _getActiveDomElement(beans);
    let inner = active?.shadowRoot?.activeElement;
    while (inner) {
        active = inner;
        inner = inner.shadowRoot?.activeElement;
    }
    return active;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getDocument(beans: UtilBeanCollection): Document {
    // if user is providing document, we use the users one,
    // otherwise we use the document on the global namespace.
    const { gos, eRootDiv } = beans;
    let result: Document | null = null;
    const optionsGetDocument = gos.get('getDocument');
    if (optionsGetDocument && _exists(optionsGetDocument)) {
        result = optionsGetDocument();
    } else if (eRootDiv) {
        result = eRootDiv.ownerDocument;
    }

    if (result && _exists(result)) {
        return result;
    }

    return document;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isNothingFocused(beans: UtilBeanCollection, activeEl = _getActiveDomElement(beans)): boolean {
    // nothing, or what encloses the grid (the body, a focus trap's container); contains() stops at a shadow boundary
    let node: Node | undefined = beans.eRootDiv;
    while (activeEl && node && !activeEl.contains(node)) {
        node = shadowHostOf(node.getRootNode());
    }
    return !activeEl || node != null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getWindow(beans: UtilBeanCollection) {
    const eDocument = _getDocument(beans);
    return eDocument.defaultView || window;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getPageBody(beans: UtilBeanCollection): HTMLElement | ShadowRoot {
    let rootNode: Document | ShadowRoot | HTMLElement | null = null;
    let targetEl: HTMLElement | ShadowRoot | null;

    try {
        rootNode = _getDocument(beans).fullscreenElement as HTMLElement;
    } catch {
        // some environments like SalesForce will throw errors
        // simply by trying to read the fullscreenElement property
    } finally {
        if (!rootNode) {
            rootNode = _getRootNode(beans);
        }
        const body = rootNode.querySelector('body');
        if (body) {
            targetEl = body;
        } else if (rootNode instanceof ShadowRoot) {
            targetEl = rootNode;
        } else if (rootNode instanceof Document) {
            targetEl = rootNode?.documentElement;
        } else {
            targetEl = rootNode;
        }
    }

    return targetEl;
}

export function _getBodyWidth(beans: UtilBeanCollection): number {
    const body = _getPageBody(beans) as HTMLElement;
    return body?.clientWidth ?? (window.innerWidth || -1);
}

export function _getBodyHeight(beans: UtilBeanCollection): number {
    const body = _getPageBody(beans) as HTMLElement;
    return body?.clientHeight ?? (window.innerHeight || -1);
}

/** A shadow root's host; undefined for a document, a plain fragment or the top of a detached subtree. */
function shadowHostOf(root: Node): Element | undefined {
    return root.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? (root as ShadowRoot).host : undefined;
}

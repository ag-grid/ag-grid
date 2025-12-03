import type { UtilBeanCollection } from '../interfaces/agCoreBeanCollection';
import { _exists } from './generic';

/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _getRootNode(beans: UtilBeanCollection): Document | ShadowRoot {
    return beans.eRootDiv.getRootNode() as Document | ShadowRoot;
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _getActiveDomElement(beans: UtilBeanCollection): Element | null {
    return _getRootNode(beans).activeElement;
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
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
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _isNothingFocused(beans: UtilBeanCollection): boolean {
    const activeEl = _getActiveDomElement(beans);

    return activeEl === null || activeEl === _getDocument(beans).body;
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _getWindow(beans: UtilBeanCollection) {
    const eDocument = _getDocument(beans);
    return eDocument.defaultView || window;
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _getPageBody(beans: UtilBeanCollection): HTMLElement | ShadowRoot {
    let rootNode: Document | ShadowRoot | HTMLElement | null = null;
    let targetEl: HTMLElement | ShadowRoot | null = null;

    try {
        rootNode = _getDocument(beans).fullscreenElement as HTMLElement;
    } catch (e) {
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
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _getBodyWidth(beans: UtilBeanCollection): number {
    const body = _getPageBody(beans) as HTMLElement;
    return body?.clientWidth ?? (window.innerWidth || -1);
}
/** @AG_Grid_Internal Not for general use, may change without warning. */
export function _getBodyHeight(beans: UtilBeanCollection): number {
    const body = _getPageBody(beans) as HTMLElement;
    return body?.clientHeight ?? (window.innerHeight || -1);
}

import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import { _exists } from './generic';

export function _getRootNode(beans: AgCoreBeanCollection<any, any, any, any>): Document | ShadowRoot {
    return beans.eRootDiv.getRootNode() as Document | ShadowRoot;
}

export function _getActiveDomElement(beans: AgCoreBeanCollection<any, any, any, any>): Element | null {
    return _getRootNode(beans).activeElement;
}

export function _getDocument(beans: AgCoreBeanCollection<any, any, any, any>): Document {
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

export function _isNothingFocused(beans: AgCoreBeanCollection<any, any, any, any>): boolean {
    const activeEl = _getActiveDomElement(beans);

    return activeEl === null || activeEl === _getDocument(beans).body;
}

export function _getWindow(beans: AgCoreBeanCollection<any, any, any, any>) {
    const eDocument = _getDocument(beans);
    return eDocument.defaultView || window;
}

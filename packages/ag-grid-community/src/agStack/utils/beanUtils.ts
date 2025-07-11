import type { AgCoreBeanCollection } from '../interfaces/iContext';

export function _getRootNode(beans: AgCoreBeanCollection<any, any, any, any>): Document | ShadowRoot {
    return beans.eRootDiv.getRootNode() as Document | ShadowRoot;
}

export function _getActiveDomElement(beans: AgCoreBeanCollection<any, any, any, any>): Element | null {
    return _getRootNode(beans).activeElement;
}

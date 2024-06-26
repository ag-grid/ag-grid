import type { CellStyle } from '../entities/colDef';
import type { RowStyle } from '../entities/gridOptions';
import type { ICellRendererComp } from '../rendering/cellRenderers/iCellRenderer';
import type { AgPromise } from './promise';
/**
 * This method adds a class to an element and remove that class from all siblings.
 * Useful for toggling state.
 * @param {HTMLElement} element The element to receive the class
 * @param {string} elementClass The class to be assigned to the element
 * @param {boolean} otherElementClass The class to be assigned to siblings of the element, but not the element itself
 */
export declare function _radioCssClass(element: HTMLElement, elementClass: string | null, otherElementClass?: string | null): void;
export declare const FOCUSABLE_SELECTOR = "[tabindex], input, select, button, textarea, [href]";
export declare const FOCUSABLE_EXCLUDE = "[disabled], .ag-disabled:not(.ag-button), .ag-disabled *";
export declare function _isFocusableFormField(element: HTMLElement): boolean;
export declare function _setDisplayed(element: Element, displayed: boolean, options?: {
    skipAriaHidden?: boolean;
}): void;
export declare function _setVisible(element: HTMLElement, visible: boolean, options?: {
    skipAriaHidden?: boolean;
}): void;
export declare function _setDisabled(element: HTMLElement, disabled: boolean): void;
export declare function _isElementChildOfClass(element: HTMLElement | null, cls: string, maxNest?: HTMLElement | number): boolean;
export declare function _getElementSize(el: HTMLElement): {
    height: number;
    width: number;
    borderTopWidth: number;
    borderRightWidth: number;
    borderBottomWidth: number;
    borderLeftWidth: number;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
    boxSizing: string;
};
export declare function _getInnerHeight(el: HTMLElement): number;
export declare function _getInnerWidth(el: HTMLElement): number;
export declare function _getAbsoluteHeight(el: HTMLElement): number;
export declare function _getAbsoluteWidth(el: HTMLElement): number;
export declare function _getElementRectWithOffset(el: HTMLElement): {
    top: number;
    left: number;
    right: number;
    bottom: number;
};
export declare function _isRtlNegativeScroll(): boolean;
export declare function _getScrollLeft(element: HTMLElement, rtl: boolean): number;
export declare function _setScrollLeft(element: HTMLElement, value: number, rtl: boolean): void;
export declare function _clearElement(el: HTMLElement): void;
export declare function _removeFromParent(node: Element | null): void;
export declare function _isInDOM(element: HTMLElement): boolean;
export declare function _isVisible(element: HTMLElement): any;
/**
 * Loads the template and returns it as an element. makes up for no simple way in
 * the dom api to load html directly, eg we cannot do this: document.createElement(template)
 * @param {string} template
 * @returns {HTMLElement}
 */
export declare function _loadTemplate(template: string): HTMLElement;
export declare function _ensureDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore?: HTMLElement | null): void;
export declare function _setDomChildOrder(eContainer: HTMLElement, orderedChildren: (HTMLElement | null)[]): void;
export declare function _insertWithDomOrder(eContainer: HTMLElement, eToInsert: HTMLElement, eChildBefore: HTMLElement | null): void;
export declare function _addStylesToElement(eElement: any, styles: RowStyle | CellStyle | null | undefined): void;
export declare function _isHorizontalScrollShowing(element: HTMLElement): boolean;
export declare function _isVerticalScrollShowing(element: HTMLElement): boolean;
export declare function _setElementWidth(element: HTMLElement, width: string | number): void;
export declare function _setFixedWidth(element: HTMLElement, width: string | number): void;
export declare function _setElementHeight(element: HTMLElement, height: string | number): void;
export declare function _setFixedHeight(element: HTMLElement, height: string | number): void;
export declare function _formatSize(size: number | string): string;
export declare function _isNodeOrElement(o: any): o is Node | Element;
/**
 * Makes a copy of a node list into a list
 * @param {NodeList} nodeList
 * @returns {Node[]}
 */
export declare function _copyNodeList(nodeList: NodeListOf<Node> | null): Node[];
export declare function _iterateNamedNodeMap(map: NamedNodeMap, callback: (key: string, value: string) => void): void;
export declare function _addOrRemoveAttribute(element: HTMLElement, name: string, value: any): void;
export declare function _nodeListForEach<T extends Node>(nodeList: NodeListOf<T> | null, action: (value: T) => void): void;
/**
 * cell renderers are used in a few places. they bind to dom slightly differently to other cell renders as they
 * can return back strings (instead of html element) in the getGui() method. common code placed here to handle that.
 * @param {AgPromise<ICellRendererComp>} cellRendererPromise
 * @param {HTMLElement} eTarget
 */
export declare function _bindCellRendererToHtmlElement(cellRendererPromise: AgPromise<ICellRendererComp>, eTarget: HTMLElement): void;

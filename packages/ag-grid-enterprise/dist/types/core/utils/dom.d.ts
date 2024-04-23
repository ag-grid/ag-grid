import { CellStyle } from '../entities/colDef';
import { RowStyle } from '../entities/gridOptions';
import { ICellRendererComp } from '../rendering/cellRenderers/iCellRenderer';
import { AgPromise } from './promise';
/**
 * This method adds a class to an element and remove that class from all siblings.
 * Useful for toggling state.
 * @param {HTMLElement} element The element to receive the class
 * @param {string} elementClass The class to be assigned to the element
 * @param {boolean} otherElementClass The class to be assigned to siblings of the element, but not the element itself
 */
export declare function radioCssClass(element: HTMLElement, elementClass: string | null, otherElementClass?: string | null): void;
export declare const FOCUSABLE_SELECTOR = "[tabindex], input, select, button, textarea, [href]";
export declare const FOCUSABLE_EXCLUDE = "[disabled], .ag-disabled:not(.ag-button), .ag-disabled *";
export declare function isFocusableFormField(element: HTMLElement): boolean;
export declare function setDisplayed(element: Element, displayed: boolean, options?: {
    skipAriaHidden?: boolean;
}): void;
export declare function setVisible(element: HTMLElement, visible: boolean, options?: {
    skipAriaHidden?: boolean;
}): void;
export declare function setDisabled(element: HTMLElement, disabled: boolean): void;
export declare function isElementChildOfClass(element: HTMLElement | null, cls: string, maxNest?: HTMLElement | number): boolean;
export declare function getElementSize(el: HTMLElement): {
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
export declare function getInnerHeight(el: HTMLElement): number;
export declare function getInnerWidth(el: HTMLElement): number;
export declare function getAbsoluteHeight(el: HTMLElement): number;
export declare function getAbsoluteWidth(el: HTMLElement): number;
export declare function getElementRectWithOffset(el: HTMLElement): {
    top: number;
    left: number;
    right: number;
    bottom: number;
};
export declare function isRtlNegativeScroll(): boolean;
export declare function getScrollLeft(element: HTMLElement, rtl: boolean): number;
export declare function setScrollLeft(element: HTMLElement, value: number, rtl: boolean): void;
export declare function clearElement(el: HTMLElement): void;
export declare function removeFromParent(node: Element | null): void;
export declare function isInDOM(element: HTMLElement): boolean;
export declare function isVisible(element: HTMLElement): any;
/**
 * Loads the template and returns it as an element. makes up for no simple way in
 * the dom api to load html directly, eg we cannot do this: document.createElement(template)
 * @param {string} template
 * @returns {HTMLElement}
 */
export declare function loadTemplate(template: string): HTMLElement;
export declare function ensureDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore?: HTMLElement | null): void;
export declare function setDomChildOrder(eContainer: HTMLElement, orderedChildren: (HTMLElement | null)[]): void;
export declare function insertWithDomOrder(eContainer: HTMLElement, eToInsert: HTMLElement, eChildBefore: HTMLElement | null): void;
export declare function addStylesToElement(eElement: any, styles: RowStyle | CellStyle | null | undefined): void;
export declare function isHorizontalScrollShowing(element: HTMLElement): boolean;
export declare function isVerticalScrollShowing(element: HTMLElement): boolean;
export declare function setElementWidth(element: HTMLElement, width: string | number): void;
export declare function setFixedWidth(element: HTMLElement, width: string | number): void;
export declare function setElementHeight(element: HTMLElement, height: string | number): void;
export declare function setFixedHeight(element: HTMLElement, height: string | number): void;
export declare function formatSize(size: number | string): string;
export declare function isNodeOrElement(o: any): boolean;
/**
 * Makes a copy of a node list into a list
 * @param {NodeList} nodeList
 * @returns {Node[]}
 */
export declare function copyNodeList(nodeList: NodeListOf<Node> | null): Node[];
export declare function iterateNamedNodeMap(map: NamedNodeMap, callback: (key: string, value: string) => void): void;
export declare function addOrRemoveAttribute(element: HTMLElement, name: string, value: any): void;
export declare function nodeListForEach<T extends Node>(nodeList: NodeListOf<T> | null, action: (value: T) => void): void;
/**
 * cell renderers are used in a few places. they bind to dom slightly differently to other cell renders as they
 * can return back strings (instead of html element) in the getGui() method. common code placed here to handle that.
 * @param {AgPromise<ICellRendererComp>} cellRendererPromise
 * @param {HTMLElement} eTarget
 */
export declare function bindCellRendererToHtmlElement(cellRendererPromise: AgPromise<ICellRendererComp>, eTarget: HTMLElement): void;

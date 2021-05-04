export declare function addCssClass(element: HTMLElement, className: string): HTMLElement | undefined;
export declare function removeCssClass(element: HTMLElement, className: string): void;
export declare function addOrRemoveCssClass(element: HTMLElement, className: string, addOrRemove: boolean): void;
/**
 * This method adds a class to an element and remove that class from all siblings.
 * Useful for toggling state.
 * @param {HTMLElement} element The element to receive the class
 * @param {string} elementClass The class to be assigned to the element
 * @param {boolean} otherElementClass The class to be assigned to siblings of the element, but not the element itself
 */
export declare function radioCssClass(element: HTMLElement, elementClass: string | null, otherElementClass?: string | null): void;
export declare function containsClass(element: HTMLElement, className: string): boolean;
export declare function isFocusableFormField(element: HTMLElement): boolean;
export declare function setDisplayed(element: HTMLElement, displayed: boolean): void;
export declare function setVisible(element: HTMLElement, visible: boolean): void;
export declare function setDisabled(element: HTMLElement, disabled: boolean): void;
export declare function isElementChildOfClass(element: HTMLElement | null, cls: string, maxNest?: number): boolean;
export declare function getElementSize(el: HTMLElement): {
    height: number;
    width: number;
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
export declare function isRtlNegativeScroll(): boolean;
export declare function getScrollLeft(element: HTMLElement, rtl: boolean): number;
export declare function setScrollLeft(element: HTMLElement, value: number, rtl: boolean): void;
export declare function clearElement(el: HTMLElement): void;
/** @deprecated */
export declare function removeElement(parent: HTMLElement, cssSelector: string): void;
export declare function removeFromParent(node: Element | null): void;
export declare function isVisible(element: HTMLElement): boolean;
/**
 * Loads the template and returns it as an element. makes up for no simple way in
 * the dom api to load html directly, eg we cannot do this: document.createElement(template)
 * @param {string} template
 * @returns {HTMLElement}
 */
export declare function loadTemplate(template: string): HTMLElement;
export declare function appendHtml(eContainer: HTMLElement, htmlTemplate: string): void;
/** @deprecated */
export declare function getElementAttribute(element: any, attributeName: string): string | null;
export declare function offsetHeight(element: HTMLElement): number;
export declare function offsetWidth(element: HTMLElement): number;
export declare function ensureDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore?: HTMLElement | null): void;
export declare function setDomChildOrder(eContainer: HTMLElement, orderedChildren: (HTMLElement | null)[]): void;
export declare function insertWithDomOrder(eContainer: HTMLElement, eToInsert: HTMLElement, eChildBefore: HTMLElement | null): void;
/** @deprecated */
export declare function prependDC(parent: HTMLElement, documentFragment: DocumentFragment): void;
export declare function addStylesToElement(eElement: any, styles: any): void;
export declare function isHorizontalScrollShowing(element: HTMLElement): boolean;
export declare function isVerticalScrollShowing(element: HTMLElement): boolean;
export declare function setElementWidth(element: HTMLElement, width: string | number): void;
export declare function setFixedWidth(element: HTMLElement, width: string | number): void;
export declare function setElementHeight(element: HTMLElement, height: string | number): void;
export declare function setFixedHeight(element: HTMLElement, height: string | number): void;
export declare function formatSize(size: number | string): string;
/**
 * Returns true if it is a DOM node
 * taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
 * @param {any} o
 * @return {boolean}
 */
export declare function isNode(o: any): boolean;
/**
 * Returns true if it is a DOM element
 * taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
 * @param {any} o
 * @returns {boolean}
 */
export declare function isElement(o: any): boolean;
export declare function isNodeOrElement(o: any): boolean;
/**
 * Makes a copy of a node list into a list
 * @param {NodeList} nodeList
 * @returns {Node[]}
 */
export declare function copyNodeList(nodeList: NodeListOf<Node> | null): Node[];
export declare function iterateNamedNodeMap(map: NamedNodeMap, callback: (key: string, value: string) => void): void;
/** @deprecated */
export declare function setCheckboxState(eCheckbox: HTMLInputElement, state: any): void;
export declare function addOrRemoveAttribute(element: HTMLElement, name: string, value: any): void;
export declare function nodeListForEach<T extends Node>(nodeList: NodeListOf<T> | null, action: (value: T) => void): void;

// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { Column } from "./entities/column";
import { RowNode } from "./entities/rowNode";
export declare class Utils {
    private static isSafari;
    private static isIE;
    static iterateObject(object: any, callback: (key: string, value: any) => void): void;
    static cloneObject(object: any): any;
    static map<TItem, TResult>(array: TItem[], callback: (item: TItem) => TResult): TResult[];
    static mapObject<TResult>(object: any, callback: (item: any) => TResult): TResult[];
    static forEach<T>(array: T[], callback: (item: T, index: number) => void): void;
    static filter<T>(array: T[], callback: (item: T) => boolean): T[];
    static assign(object: any, source: any): void;
    static getFunctionParameters(func: any): any;
    static find<T>(collection: T[], predicate: string | ((item: T) => void), value?: any): T;
    static toStrings<T>(array: T[]): string[];
    static iterateArray<T>(array: T[], callback: (item: T, index: number) => void): void;
    static isNode(o: any): boolean;
    static isElement(o: any): boolean;
    static isNodeOrElement(o: any): boolean;
    static addChangeListener(element: HTMLElement, listener: EventListener): void;
    static makeNull(value: any): any;
    static missing(value: any): boolean;
    static missingOrEmpty(value: any[] | string): boolean;
    static exists(value: any): boolean;
    static existsAndNotEmpty(value: any[]): boolean;
    static removeAllChildren(node: HTMLElement): void;
    static removeElement(parent: HTMLElement, cssSelector: string): void;
    static removeFromParent(node: Element): void;
    static isVisible(element: HTMLElement): boolean;
    /**
     * loads the template and returns it as an element. makes up for no simple way in
     * the dom api to load html directly, eg we cannot do this: document.createElement(template)
     */
    static loadTemplate(template: string): HTMLElement;
    static addOrRemoveCssClass(element: HTMLElement, className: string, addOrRemove: boolean): void;
    static callIfPresent(func: Function): void;
    static addCssClass(element: HTMLElement, className: string): void;
    static offsetHeight(element: HTMLElement): number;
    static offsetWidth(element: HTMLElement): number;
    static removeCssClass(element: HTMLElement, className: string): void;
    static removeFromArray<T>(array: T[], object: T): void;
    static defaultComparator(valueA: any, valueB: any): number;
    static formatWidth(width: number | string): string;
    static formatNumberTwoDecimalPlacesAndCommas(value: number): string;
    /**
     * Tries to use the provided renderer.
     */
    static useRenderer<TParams>(eParent: Element, eRenderer: (params: TParams) => Node | string, params: TParams): void;
    /**
     * If icon provided, use this (either a string, or a function callback).
     * if not, then use the second parameter, which is the svgFactory function
     */
    static createIcon(iconName: string, gridOptionsWrapper: GridOptionsWrapper, column: Column, svgFactoryFunc: () => Node): HTMLSpanElement;
    static createIconNoSpan(iconName: string, gridOptionsWrapper: GridOptionsWrapper, colDefWrapper: Column, svgFactoryFunc: () => Node): any;
    static addStylesToElement(eElement: any, styles: any): void;
    static getScrollbarWidth(): number;
    static isKeyPressed(event: KeyboardEvent, keyToCheck: number): boolean;
    static setVisible(element: HTMLElement, visible: boolean, visibleStyle?: string): void;
    static isBrowserIE(): boolean;
    static isBrowserSafari(): boolean;
    static getBodyWidth(): number;
    static getBodyHeight(): number;
    static setCheckboxState(eCheckbox: any, state: any): void;
    static traverseNodesWithKey(nodes: RowNode[], callback: (node: RowNode, key: string) => void): void;
}

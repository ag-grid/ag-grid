// Type definitions for ag-grid v5.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { Column } from "./entities/column";
import { RowNode } from "./entities/rowNode";
export declare class Timer {
    private timestamp;
    print(msg: string): void;
}
export declare class Utils {
    private static isSafari;
    private static isIE;
    static getNameOfClass(TheClass: any): string;
    static values<T>(object: {
        [key: string]: T;
    }): T[];
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
    static containsClass(element: any, className: string): boolean;
    static getElementAttribute(element: any, attributeName: string): string;
    static offsetHeight(element: HTMLElement): number;
    static offsetWidth(element: HTMLElement): number;
    static removeCssClass(element: HTMLElement, className: string): void;
    static removeRepeatsFromArray<T>(array: T[], object: T): void;
    static removeFromArray<T>(array: T[], object: T): void;
    static insertIntoArray<T>(array: T[], object: T, toIndex: number): void;
    static moveInArray<T>(array: T[], objectsToMove: T[], toIndex: number): void;
    static defaultComparator(valueA: any, valueB: any): number;
    static compareArrays(array1: any[], array2: any[]): boolean;
    static toStringOrNull(value: any): string;
    static formatWidth(width: number | string): string;
    static formatNumberTwoDecimalPlacesAndCommas(value: number): string;
    /**
     * If icon provided, use this (either a string, or a function callback).
     * if not, then use the second parameter, which is the svgFactory function
     */
    static createIcon(iconName: string, gridOptionsWrapper: GridOptionsWrapper, column: Column, svgFactoryFunc: () => HTMLElement): HTMLElement;
    static createIconNoSpan(iconName: string, gridOptionsWrapper: GridOptionsWrapper, colDefWrapper: Column, svgFactoryFunc: () => HTMLElement): HTMLElement;
    static addStylesToElement(eElement: any, styles: any): void;
    static getScrollbarWidth(): number;
    static isKeyPressed(event: KeyboardEvent, keyToCheck: number): boolean;
    static setVisible(element: HTMLElement, visible: boolean, visibleStyle?: string): void;
    static isBrowserIE(): boolean;
    static isBrowserSafari(): boolean;
    static getTarget(event: Event): Element;
    static getBodyWidth(): number;
    static getBodyHeight(): number;
    static setCheckboxState(eCheckbox: any, state: any): void;
    static traverseNodesWithKey(nodes: RowNode[], callback: (node: RowNode, key: string) => void): void;
    /**
     * Mouse wheel (and 2-finger trackpad) support on the web sucks.  It is
     * complicated, thus this doc is long and (hopefully) detailed enough to answer
     * your questions.
     *
     * If you need to react to the mouse wheel in a predictable way, this code is
     * like your bestest friend. * hugs *
     *
     * As of today, there are 4 DOM event types you can listen to:
     *
     *   'wheel'                -- Chrome(31+), FF(17+), IE(9+)
     *   'mousewheel'           -- Chrome, IE(6+), Opera, Safari
     *   'MozMousePixelScroll'  -- FF(3.5 only!) (2010-2013) -- don't bother!
     *   'DOMMouseScroll'       -- FF(0.9.7+) since 2003
     *
     * So what to do?  The is the best:
     *
     *   normalizeWheel.getEventType();
     *
     * In your event callback, use this code to get sane interpretation of the
     * deltas.  This code will return an object with properties:
     *
     *   spinX   -- normalized spin speed (use for zoom) - x plane
     *   spinY   -- " - y plane
     *   pixelX  -- normalized distance (to pixels) - x plane
     *   pixelY  -- " - y plane
     *
     * Wheel values are provided by the browser assuming you are using the wheel to
     * scroll a web page by a number of lines or pixels (or pages).  Values can vary
     * significantly on different platforms and browsers, forgetting that you can
     * scroll at different speeds.  Some devices (like trackpads) emit more events
     * at smaller increments with fine granularity, and some emit massive jumps with
     * linear speed or acceleration.
     *
     * This code does its best to normalize the deltas for you:
     *
     *   - spin is trying to normalize how far the wheel was spun (or trackpad
     *     dragged).  This is super useful for zoom support where you want to
     *     throw away the chunky scroll steps on the PC and make those equal to
     *     the slow and smooth tiny steps on the Mac. Key data: This code tries to
     *     resolve a single slow step on a wheel to 1.
     *
     *   - pixel is normalizing the desired scroll delta in pixel units.  You'll
     *     get the crazy differences between browsers, but at least it'll be in
     *     pixels!
     *
     *   - positive value indicates scrolling DOWN/RIGHT, negative UP/LEFT.  This
     *     should translate to positive value zooming IN, negative zooming OUT.
     *     This matches the newer 'wheel' event.
     *
     * Why are there spinX, spinY (or pixels)?
     *
     *   - spinX is a 2-finger side drag on the trackpad, and a shift + wheel turn
     *     with a mouse.  It results in side-scrolling in the browser by default.
     *
     *   - spinY is what you expect -- it's the classic axis of a mouse wheel.
     *
     *   - I dropped spinZ/pixelZ.  It is supported by the DOM 3 'wheel' event and
     *     probably is by browsers in conjunction with fancy 3D controllers .. but
     *     you know.
     *
     * Implementation info:
     *
     * Examples of 'wheel' event if you scroll slowly (down) by one step with an
     * average mouse:
     *
     *   OS X + Chrome  (mouse)     -    4   pixel delta  (wheelDelta -120)
     *   OS X + Safari  (mouse)     -  N/A   pixel delta  (wheelDelta  -12)
     *   OS X + Firefox (mouse)     -    0.1 line  delta  (wheelDelta  N/A)
     *   Win8 + Chrome  (mouse)     -  100   pixel delta  (wheelDelta -120)
     *   Win8 + Firefox (mouse)     -    3   line  delta  (wheelDelta -120)
     *
     * On the trackpad:
     *
     *   OS X + Chrome  (trackpad)  -    2   pixel delta  (wheelDelta   -6)
     *   OS X + Firefox (trackpad)  -    1   pixel delta  (wheelDelta  N/A)
     *
     * On other/older browsers.. it's more complicated as there can be multiple and
     * also missing delta values.
     *
     * The 'wheel' event is more standard:
     *
     * http://www.w3.org/TR/DOM-Level-3-Events/#events-wheelevents
     *
     * The basics is that it includes a unit, deltaMode (pixels, lines, pages), and
     * deltaX, deltaY and deltaZ.  Some browsers provide other values to maintain
     * backward compatibility with older events.  Those other values help us
     * better normalize spin speed.  Example of what the browsers provide:
     *
     *                          | event.wheelDelta | event.detail
     *        ------------------+------------------+--------------
     *          Safari v5/OS X  |       -120       |       0
     *          Safari v5/Win7  |       -120       |       0
     *         Chrome v17/OS X  |       -120       |       0
     *         Chrome v17/Win7  |       -120       |       0
     *                IE9/Win7  |       -120       |   undefined
     *         Firefox v4/OS X  |     undefined    |       1
     *         Firefox v4/Win7  |     undefined    |       3
     *
     */
    static normalizeWheel(event: any): any;
}
export declare class NumberSequence {
    private nextValue;
    next(): number;
}

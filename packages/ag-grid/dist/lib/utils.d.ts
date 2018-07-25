// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
    private static isEdge;
    private static isChrome;
    private static isFirefox;
    private static isIPad;
    private static PRINTABLE_CHARACTERS;
    private static NUMPAD_DEL_NUMLOCK_ON_KEY;
    private static NUMPAD_DEL_NUMLOCK_ON_CHARCODE;
    private static doOnceFlags;
    static doOnce(func: () => void, key: string): void;
    static areEventsNear(e1: MouseEvent | Touch, e2: MouseEvent | Touch, pixelCount: number): boolean;
    static shallowCompare(arr1: any[], arr2: any[]): boolean;
    static getNameOfClass(TheClass: any): string;
    static values<T>(object: {
        [key: string]: T;
    }): T[];
    static getValueUsingField(data: any, field: string, fieldContainsDots: boolean): any;
    static getScrollLeft(element: HTMLElement, rtl: boolean): number;
    static cleanNumber(value: any): number;
    static setScrollLeft(element: HTMLElement, value: number, rtl: boolean): void;
    static iterateNamedNodeMap(map: NamedNodeMap, callback: (key: string, value: string) => void): void;
    static iterateObject<T>(object: {
        [p: string]: T;
    } | T[], callback: (key: string, value: T) => void): void;
    static cloneObject<T>(object: T): T;
    static map<TItem, TResult>(array: TItem[], callback: (item: TItem) => TResult): TResult[];
    static mapObject<TResult>(object: any, callback: (item: any) => TResult): TResult[];
    static forEach<T>(array: T[], callback: (item: T, index: number) => void): void;
    static filter<T>(array: T[], callback: (item: T) => boolean): T[];
    static getAllKeysInObjects(objects: any[]): string[];
    static mergeDeep(dest: any, source: any): void;
    static assign(object: any, ...sources: any[]): any;
    static parseYyyyMmDdToDate(yyyyMmDd: string, separator: string): Date;
    static serializeDateToYyyyMmDd(date: Date, separator: string): string;
    static pad(num: number, totalStringSize: number): string;
    static pushAll(target: any[], source: any[]): void;
    static createArrayOfNumbers(first: number, last: number): number[];
    static getFunctionParameters(func: any): any;
    static find<T>(collection: T[] | {
        [id: string]: T;
    }, predicate: string | boolean | ((item: T) => void), value?: any): T;
    static toStrings<T>(array: T[]): string[];
    static iterateArray<T>(array: T[], callback: (item: T, index: number) => void): void;
    static isNode(o: any): boolean;
    static isElement(o: any): boolean;
    static isNodeOrElement(o: any): boolean;
    static copyNodeList(nodeList: NodeList): Node[];
    static isEventFromPrintableCharacter(event: KeyboardEvent): boolean;
    static addChangeListener(element: HTMLElement, listener: EventListener): void;
    static makeNull<T>(value: T): T;
    static missing(value: any): boolean;
    static missingOrEmpty(value: any[] | string): boolean;
    static missingOrEmptyObject(value: any): boolean;
    static exists(value: any): boolean;
    static firstExistingValue<A>(...values: A[]): A;
    static anyExists(values: any[]): boolean;
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
    static appendHtml(eContainer: HTMLElement, htmlTemplate: string): void;
    static addOrRemoveCssClass(element: HTMLElement, className: string, addOrRemove: boolean): void;
    static callIfPresent(func: Function): void;
    static addCssClass(element: HTMLElement, className: string): void;
    static containsClass(element: any, className: string): boolean;
    static getElementAttribute(element: any, attributeName: string): string;
    static offsetHeight(element: HTMLElement): number;
    static offsetWidth(element: HTMLElement): number;
    static sortNumberArray(numberArray: number[]): void;
    static removeCssClass(element: HTMLElement, className: string): void;
    static removeRepeatsFromArray<T>(array: T[], object: T): void;
    static removeFromArray<T>(array: T[], object: T): void;
    static removeAllFromArray<T>(array: T[], toRemove: T[]): void;
    static insertIntoArray<T>(array: T[], object: T, toIndex: number): void;
    static insertArrayIntoArray<T>(dest: T[], src: T[], toIndex: number): void;
    static moveInArray<T>(array: T[], objectsToMove: T[], toIndex: number): void;
    static defaultComparator(valueA: any, valueB: any, accentedCompare?: boolean): number;
    static compareArrays(array1: any[], array2: any[]): boolean;
    static ensureDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore: HTMLElement): void;
    static insertWithDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore: HTMLElement): void;
    static insertTemplateWithDomOrder(eContainer: HTMLElement, htmlTemplate: string, eChildBefore: HTMLElement): HTMLElement;
    static every<T>(items: T[], callback: (item: T) => boolean): boolean;
    static toStringOrNull(value: any): string;
    static formatWidth(width: number | string): string;
    static formatNumberTwoDecimalPlacesAndCommas(value: number): string;
    static formatNumberCommas(value: number): string;
    static prependDC(parent: HTMLElement, documentFragment: DocumentFragment): void;
    static iconNameClassMap: {
        [key: string]: string;
    };
    /**
     * If icon provided, use this (either a string, or a function callback).
     * if not, then use the default icon from the theme
     */
    static createIcon(iconName: string, gridOptionsWrapper: GridOptionsWrapper, column: Column): HTMLElement;
    static createIconNoSpan(iconName: string, gridOptionsWrapper: GridOptionsWrapper, column: Column): HTMLElement;
    static addStylesToElement(eElement: any, styles: any): void;
    static isHorizontalScrollShowing(element: HTMLElement): boolean;
    static isVerticalScrollShowing(element: HTMLElement): boolean;
    static getMaxDivHeight(): number;
    static getScrollbarWidth(): number;
    static isKeyPressed(event: KeyboardEvent, keyToCheck: number): boolean;
    static setVisible(element: HTMLElement, visible: boolean): void;
    static setHidden(element: HTMLElement, hidden: boolean): void;
    static isBrowserIE(): boolean;
    static isBrowserEdge(): boolean;
    static isBrowserSafari(): boolean;
    static isBrowserChrome(): boolean;
    static isBrowserFirefox(): boolean;
    static isUserAgentIPad(): boolean;
    static getTarget(event: Event): Element;
    static isElementInEventPath(element: HTMLElement, event: Event): boolean;
    static createEventPath(event: Event): EventTarget[];
    static addAgGridEventPath(event: Event): void;
    static getEventPath(event: Event): EventTarget[];
    static forEachSnapshotFirst(list: any[], callback: (item: any) => void): void;
    static getBodyWidth(): number;
    static getBodyHeight(): number;
    static setCheckboxState(eCheckbox: any, state: any): void;
    static traverseNodesWithKey(nodes: RowNode[], callback: (node: RowNode, key: string) => void): void;
    static camelCaseToHyphen(str: string): string;
    static hyphenToCamelCase(str: string): string;
    static cssStyleObjectToMarkup(stylesToUse: any): string;
    /**
     * From http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
     */
    static isNumeric(value: any): boolean;
    static escape(toEscape: string): string;
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
    /**
     * https://stackoverflow.com/questions/24004791/can-someone-explain-the-debounce-function-in-javascript
     */
    static debounce(func: () => void, wait: number, immediate?: boolean): () => void;
    static stopPropagationForAgGrid(event: Event): void;
    static isStopPropagationForAgGrid(event: Event): boolean;
    static executeInAWhile(funcs: Function[]): void;
    static executeNextVMTurn(funcs: Function[]): void;
    static executeAfter(funcs: Function[], millis: number): void;
    static referenceCompare(left: any, right: any): boolean;
    static get(source: {
        [p: string]: any;
    }, expression: string, defaultValue: any): any;
    static passiveEvents: string[];
    static addSafePassiveEventListener(eElement: HTMLElement, event: string, listener: (event?: any) => void): void;
    static camelCaseToHumanText(camelCase: string): string;
    static message(msg: string): void;
    static sortRowNodesByOrder(rowNodes: RowNode[], rowNodeOrder: {
        [id: string]: number;
    }): void;
    static fuzzyCheckStrings(inputValues: string[], validValues: string[], allSuggestions: string[]): {
        [p: string]: string[];
    };
    static fuzzySuggestions(inputValue: string, validValues: string[], allSuggestions: string[]): string[];
    static get_bigrams(from: string): any[];
    static string_similarity: (str1: string, str2: string) => number;
    private static isNumpadDelWithNumlockOnForEdgeOrIe(event);
}
export declare class NumberSequence {
    private nextValue;
    private step;
    constructor(initValue?: number, step?: number);
    next(): number;
    peek(): number;
    skip(count: number): void;
}
export declare let _: typeof Utils;
export declare type ResolveAndRejectCallback<T> = (resolve: (value: T) => void, reject: (params: any) => void) => void;
export declare enum PromiseStatus {
    IN_PROGRESS = 0,
    RESOLVED = 1,
}
export interface ExternalPromise<T> {
    resolve: (value: T) => void;
    promise: Promise<T>;
}
export declare class Promise<T> {
    private status;
    private resolution;
    private listOfWaiters;
    static all<T>(toCombine: Promise<T>[]): Promise<T[]>;
    static resolve<T>(value: T): Promise<T>;
    static external<T>(): ExternalPromise<T>;
    constructor(callback: ResolveAndRejectCallback<T>);
    then(func: (result: any) => void): void;
    firstOneOnly(func: (result: any) => void): void;
    map<Z>(adapter: (from: T) => Z): Promise<Z>;
    resolveNow<Z>(ifNotResolvedValue: Z, ifResolved: (current: T) => Z): Z;
    private onDone(value);
    private onReject(params);
}

// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { ICellRendererComp } from "../rendering/cellRenderers/iCellRenderer";
import { CellComp } from "../rendering/cellComp";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { Promise } from "./promise";
export declare class Utils {
    private static PASSIVE_EVENTS;
    private static OUTSIDE_ANGULAR_EVENTS;
    /**
     * These variables are lazy loaded, as otherwise they try and get initialised when we are loading
     * unit tests and we don't have references to window or document in the unit tests
     * from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
     */
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
    /**
     * When in IE or Edge, when you are editing a cell, then click on another cell,
     * the other cell doesn't keep focus, so navigation keys, type to start edit etc
     * don't work. appears that when you update the dom in IE it looses focus
     * https://ag-grid.com/forum/showthread.php?tid=4362
     * @param {HTMLElement} el
     */
    static doIeFocusHack(el: HTMLElement): void;
    /**
     * If the key was passed before, then doesn't execute the func
     * @param {Function} func
     * @param {string} key
     */
    static doOnce(func: () => void, key: string): void;
    /**
     * Checks if event was issued by a left click
     * from https://stackoverflow.com/questions/3944122/detect-left-mouse-button-press
     * @param {MouseEvent} mouseEvent
     * @returns {boolean}
     */
    static isLeftClick(mouseEvent: MouseEvent): boolean;
    /**
     * `True` if the event is close to the original event by X pixels either vertically or horizontally.
     * we only start dragging after X pixels so this allows us to know if we should start dragging yet.
     * @param {MouseEvent | TouchEvent} e1
     * @param {MouseEvent | TouchEvent} e2
     * @param {number} pixelCount
     * @returns {boolean}
     */
    static areEventsNear(e1: MouseEvent | Touch, e2: MouseEvent | Touch, pixelCount: number): boolean;
    static jsonEquals(val1: any, val2: any): boolean;
    static shallowCompare(arr1: any[], arr2: any[]): boolean;
    static getNameOfClass(TheClass: any): string;
    static values<T>(object: {
        [key: string]: T;
    }): T[];
    static getValueUsingField(data: any, field: string, fieldContainsDots: boolean): any;
    static getElementSize(el: HTMLElement): {
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
    static getInnerHeight(el: HTMLElement): number;
    static getInnerWidth(el: HTMLElement): number;
    static getAbsoluteHeight(el: HTMLElement): number;
    static getAbsoluteWidth(el: HTMLElement): number;
    static getScrollLeft(element: HTMLElement, rtl: boolean): number;
    static cleanNumber(value: any): number;
    static compose: (...fns: Function[]) => (arg: any) => any;
    static decToHex: (number: number, bytes: number) => string;
    /**
     * It encodes any string in UTF-8 format
     * taken from https://github.com/mathiasbynens/utf8.js
     * @param {string} s
     * @returns {string}
     */
    static utf8_encode: (s: string) => string;
    static setScrollLeft(element: HTMLElement, value: number, rtl: boolean): void;
    static iterateNamedNodeMap(map: NamedNodeMap, callback: (key: string, value: string) => void): void;
    static iterateObject<T>(object: {
        [p: string]: T;
    } | T[] | undefined, callback: (key: string, value: T) => void): void;
    static cloneObject<T>(object: T): T;
    static deepCloneObject<T>(object: T): T;
    static map<TItem, TResult>(array: TItem[], callback: (item: TItem, idx?: number) => TResult): TResult[];
    static mapObject<TResult>(object: any, callback: (item: any) => TResult): TResult[];
    static forEach<T>(array: T[], callback: (item: T, index: number) => void): void;
    static filter<T>(array: T[], callback: (item: T) => boolean): T[];
    static getAllKeysInObjects(objects: any[]): string[];
    static mergeDeep(dest: any, source: any): void;
    static assign(object: any, ...sources: any[]): any;
    static flatten(arrayOfArrays: any[]): any;
    static parseYyyyMmDdToDate(yyyyMmDd: string, separator: string): Date | null;
    static serializeDateToYyyyMmDd(date: Date, separator: string): string | null;
    static pad(num: number, totalStringSize: number): string;
    static pushAll(target: any[], source: any[]): void;
    static createArrayOfNumbers(first: number, last: number): number[];
    static getFunctionParameters(func: any): any;
    static find<T>(collection: T[] | {
        [id: string]: T;
    }, predicate: string | boolean | ((item: T) => boolean), value?: any): T | null;
    static toStrings<T>(array: T[]): (string | null)[];
    static iterateArray<T>(array: T[], callback: (item: T, index: number) => void): void;
    static findIndex<T>(collection: T[], predicate: (item: T, idx: number, collection: T[]) => boolean): number;
    /**
     * Returns true if it is a DOM node
     * taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
     * @param {any} o
     * @return {boolean}
     */
    static isNode(o: any): boolean;
    /**
     * Returns true if it is a DOM element
     * taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
     * @param {any} o
     * @returns {boolean}
     */
    static isElement(o: any): boolean;
    static isNodeOrElement(o: any): boolean;
    /**
     * Makes a copy of a node list into a list
     * @param {NodeList} nodeList
     * @returns {Node[]}
     */
    static copyNodeList(nodeList: NodeList): Node[];
    static isEventFromPrintableCharacter(event: KeyboardEvent): boolean;
    /**
     * Allows user to tell the grid to skip specific keyboard events
     * @param {GridOptionsWrapper} gridOptionsWrapper
     * @param {KeyboardEvent} keyboardEvent
     * @param {RowNode} rowNode
     * @param {Column} column
     * @param {boolean} editing
     * @returns {boolean}
     */
    static isUserSuppressingKeyboardEvent(gridOptionsWrapper: GridOptionsWrapper, keyboardEvent: KeyboardEvent, rowNode: RowNode, column: Column, editing: boolean): boolean;
    static getCellCompForEvent(gridOptionsWrapper: GridOptionsWrapper, event: Event): CellComp;
    /**
     * Adds all type of change listeners to an element, intended to be a text field
     * @param {HTMLElement} element
     * @param {EventListener} listener
     */
    static addChangeListener(element: HTMLElement, listener: EventListener): void;
    /**
     * If value is undefined, null or blank, returns null, otherwise returns the value
     * @param {T} value
     * @returns {T | null}
     */
    static makeNull<T>(value: T): T | null;
    static missing(value: any): boolean;
    static missingOrEmpty(value: any[] | string | undefined): boolean;
    static missingOrEmptyObject(value: any): boolean;
    static exists(value: any, allowEmptyString?: boolean): boolean;
    static firstExistingValue<A>(...values: A[]): A | null;
    static anyExists(values: any[]): boolean;
    static existsAndNotEmpty(value?: any[] | null): boolean;
    static clearElement(el: HTMLElement): void;
    static removeElement(parent: HTMLElement, cssSelector: string): void;
    static removeFromParent(node: Element | null): void;
    static isVisible(element: HTMLElement): boolean;
    static callIfPresent(func: Function): void;
    /**
     * Loads the template and returns it as an element. makes up for no simple way in
     * the dom api to load html directly, eg we cannot do this: document.createElement(template)
     * @param {string} template
     * @returns {HTMLElement}
     */
    static loadTemplate(template: string): HTMLElement;
    static appendHtml(eContainer: HTMLElement, htmlTemplate: string): void;
    static addOrRemoveCssClass(element: HTMLElement, className: string, addOrRemove: boolean): void;
    /**
     * This method adds a class to an element and remove that class from all siblings.
     * Useful for toggling state.
     * @param {HTMLElement} element The element to receive the class
     * @param {string} className The class to be assigned to the element
     * @param {boolean} [inverted] This inverts the effect, adding the class to all siblings and
     *        removing from the relevant element (useful when adding a class to hide non-selected elements).
     */
    static radioCssClass(element: HTMLElement, className: string, inverted?: boolean): void;
    static addCssClass(element: HTMLElement, className: string): void;
    static removeCssClass(element: HTMLElement, className: string): void;
    static containsClass(element: any, className: string): boolean;
    static getElementAttribute(element: any, attributeName: string): string | null;
    static offsetHeight(element: HTMLElement): number;
    static offsetWidth(element: HTMLElement): number;
    static sortNumberArray(numberArray: number[]): void;
    static removeRepeatsFromArray<T>(array: T[], object: T): void;
    static removeFromArray<T>(array: T[], object: T): void;
    static removeAllFromArray<T>(array: T[], toRemove: T[]): void;
    static insertIntoArray<T>(array: T[], object: T, toIndex: number): void;
    static insertArrayIntoArray<T>(dest: T[], src: T[], toIndex: number): void;
    static moveInArray<T>(array: T[], objectsToMove: T[], toIndex: number): void;
    static defaultComparator(valueA: any, valueB: any, accentedCompare?: boolean): number;
    static last<T>(arr: T[]): T | undefined;
    static compareArrays(array1: any[] | undefined, array2: any[]): boolean;
    static ensureDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore: HTMLElement): void;
    static insertWithDomOrder(eContainer: HTMLElement, eChild: HTMLElement, eChildBefore: HTMLElement): void;
    static insertTemplateWithDomOrder(eContainer: HTMLElement, htmlTemplate: string, eChildBefore: HTMLElement): HTMLElement;
    static every<T>(items: T[], callback: (item: T) => boolean): boolean;
    static toStringOrNull(value: any): string | null;
    static formatSize(size: number | string): string;
    static formatNumberTwoDecimalPlacesAndCommas(value: number | null): string;
    /**
     * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
     * puts in decimal places in IE, so we use this method instead
     * from: http://blog.tompawlak.org/number-currency-formatting-javascript
     * @param {number} value
     * @returns {string}
     */
    static formatNumberCommas(value: number): string;
    static prependDC(parent: HTMLElement, documentFragment: DocumentFragment): void;
    static iconNameClassMap: {
        [key: string]: string;
    };
    /**
     * If icon provided, use this (either a string, or a function callback).
     * if not, then use the default icon from the theme
     * @param {string} iconName
     * @param {GridOptionsWrapper} gridOptionsWrapper
     * @param {Column | null} [column]
     * @returns {HTMLElement}
     */
    static createIcon(iconName: string, gridOptionsWrapper: GridOptionsWrapper, column: Column | null): HTMLElement;
    static createIconNoSpan(iconName: string, gridOptionsWrapper: GridOptionsWrapper, column?: Column | null, forceCreate?: boolean): HTMLElement;
    static addStylesToElement(eElement: any, styles: any): void;
    static isHorizontalScrollShowing(element: HTMLElement): boolean;
    static isVerticalScrollShowing(element: HTMLElement): boolean;
    static getMaxDivHeight(): number;
    static getScrollbarWidth(): number;
    static hasOverflowScrolling(): boolean;
    static isKeyPressed(event: KeyboardEvent, keyToCheck: number): boolean;
    static isCharacterKey(event: KeyboardEvent): boolean;
    static setDisplayed(element: HTMLElement, displayed: boolean): void;
    static setVisible(element: HTMLElement, visible: boolean): void;
    static setElementWidth(element: HTMLElement, width: string | number): void;
    static setFixedWidth(element: HTMLElement, width: string | number): void;
    static setElementHeight(element: HTMLElement, height: string | number): void;
    static setFixedHeight(element: HTMLElement, height: string | number): void;
    static isBrowserIE(): boolean;
    static isBrowserEdge(): boolean;
    static isBrowserSafari(): boolean;
    static isBrowserChrome(): boolean;
    static isBrowserFirefox(): boolean;
    static isUserAgentIPad(): boolean;
    /**
     * srcElement is only available in IE. In all other browsers it is target
     * http://stackoverflow.com/questions/5301643/how-can-i-make-event-srcelement-work-in-firefox-and-what-does-it-mean
     * @param {Event} event
     * @returns {Element}
     */
    static getTarget(event: Event): Element;
    static isElementChildOfClass(element: HTMLElement, cls: string, maxNest?: number): boolean;
    static isElementInEventPath(element: HTMLElement, event: Event): boolean;
    static isFunction(val: any): boolean;
    static createEventPath(event: Event): EventTarget[];
    /**
     * firefox doesn't have event.path set, or any alternative to it, so we hack
     * it in. this is needed as it's to late to work out the path when the item is
     * removed from the dom. used by MouseEventService, where it works out if a click
     * was from the current grid, or a detail grid (master / detail).
     * @param {Event} event
     */
    static addAgGridEventPath(event: Event): void;
    /**
     * Gets the path for an Event.
     * https://stackoverflow.com/questions/39245488/event-path-undefined-with-firefox-and-vue-js
     * https://developer.mozilla.org/en-US/docs/Web/API/Event
     * @param {Event} event
     * @returns {EventTarget[]}
     */
    static getEventPath(event: Event): EventTarget[];
    static forEachSnapshotFirst(list: any[], callback: (item: any) => void): void;
    /**
     * Gets the document body width
     * from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
     * @returns {number}
     */
    static getBodyWidth(): number;
    /**
     * Gets the body height
     * from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
     * @returns {number}
     */
    static getBodyHeight(): number;
    static setCheckboxState(eCheckbox: any, state: any): void;
    static traverseNodesWithKey(nodes: RowNode[], callback: (node: RowNode, key: string) => void): void;
    /**
     * Converts a camelCase string into hyphenated string
     * from https://gist.github.com/youssman/745578062609e8acac9f
     * @param {string} str
     * @return {string}
     */
    static camelCaseToHyphen(str: string): string | null;
    /**
     * Converts a hyphenated string into camelCase string
     * from https://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
     * @param {string} str
     * @return {string}
     */
    static hyphenToCamelCase(str: string): string | null;
    static capitalise(str: string): string;
    /**
     * Converts a CSS object into string
     * @param {Object} stylesToUse an object eg: {color: 'black', top: '25px'}
     * @return {string} A string like "color: black; top: 25px;" for html
     */
    static cssStyleObjectToMarkup(stylesToUse: any): string;
    /**
     * Check if a value is numeric
     * from http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
     * @param {any} value
     * @return {boolean}
     */
    static isNumeric(value: any): boolean;
    static escape(toEscape: string | null): string | null;
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
     * from: https://github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
     * @param {any} event
     * @return {any}
     */
    static normalizeWheel(event: any): any;
    /**
     * from https://stackoverflow.com/questions/24004791/can-someone-explain-the-debounce-function-in-javascript
     * @param {Function} func The function to be debounced
     * @param {number} wait The time in ms to debounce
     * @param {boolean} immediate If it should run immediately or wait for the initial debounce delay
     * @return {Function} The debounced function
     */
    static debounce(func: (...args: any[]) => void, wait: number, immediate?: boolean): (...args: any[]) => void;
    /**
     * a user once raised an issue - they said that when you opened a popup (eg context menu)
     * and then clicked on a selection checkbox, the popup wasn't closed. this is because the
     * popup listens for clicks on the body, however ag-grid WAS stopping propagation on the
     * checkbox clicks (so the rows didn't pick them up as row selection selection clicks).
     * to get around this, we have a pattern to stop propagation for the purposes of ag-Grid,
     * but we still let the event pass back to teh body.
     * @param {Event} event
     */
    static stopPropagationForAgGrid(event: Event): void;
    static isStopPropagationForAgGrid(event: Event): boolean;
    static executeInAWhile(funcs: Function[]): void;
    static executeNextVMTurn(funcs: Function[]): void;
    static executeAfter(funcs: Function[], millis: number): void;
    static referenceCompare(left: any, right: any): boolean;
    static get(source: {
        [p: string]: any;
    }, expression: string, defaultValue: any): any;
    static addSafePassiveEventListener(frameworkOverrides: IFrameworkOverrides, eElement: HTMLElement, event: string, listener: (event?: any) => void): void;
    /**
     * Converts a camelCase string into regular text
     * from: https://stackoverflow.com/questions/15369566/putting-space-in-camel-case-string-using-regular-expression
     * @param {string} camelCase
     * @return {string}
     */
    static camelCaseToHumanText(camelCase: string | undefined): string | null;
    /**
     * Displays a message to the browser. this is useful in iPad, where you can't easily see the console.
     * so the javascript code can use this to give feedback. this is NOT intended to be called in production.
     * it is intended the ag-Grid developer calls this to troubleshoot, but then takes out the calls before
     * checking in.
     * @param {string} msg
     */
    static message(msg: string): void;
    /**
     * Gets called by: a) ClientSideNodeManager and b) GroupStage to do sorting.
     * when in ClientSideNodeManager we always have indexes (as this sorts the items the
     * user provided) but when in GroupStage, the nodes can contain filler nodes that
     * don't have order id's
     * @param {RowNode[]} rowNodes
     * @param {Object} rowNodeOrder
     */
    static sortRowNodesByOrder(rowNodes: RowNode[], rowNodeOrder: {
        [id: string]: number;
    }): void;
    static fuzzyCheckStrings(inputValues: string[], validValues: string[], allSuggestions: string[]): {
        [p: string]: string[];
    };
    /**
     *
     * @param {String} inputValue The value to be compared against a list of strings
     * @param allSuggestions The list of strings to be compared against
     * @param hideIrrelevant By default, fuzzy suggestions will just sort the allSuggestions list, set this to true
     *        to filter out the irrelevant values
     * @param weighted Set this to true, to make letters matched in the order they were typed have priority in the results.
     */
    static fuzzySuggestions(inputValue: string, allSuggestions: string[], hideIrrelevant?: boolean, weighted?: true): string[];
    /**
     * Algorithm to do fuzzy search
     * from https://stackoverflow.com/questions/23305000/javascript-fuzzy-search-that-makes-sense
     * @param {string} from
     * @return {[]}
     */
    static get_bigrams(from: string): any[];
    static string_distances(str1: string, str2: string): number;
    static string_weighted_distances(str1: string, str2: string): number;
    private static isNumpadDelWithNumlockOnForEdgeOrIe;
    /**
     * cell renderers are used in a few places. they bind to dom slightly differently to other cell renderes as they
     * can return back strings (instead of html elemnt) in the getGui() method. common code placed here to handle that.
     * @param {Promise<ICellRendererComp>} cellRendererPromise
     * @param {HTMLElement} eTarget
     */
    static bindCellRendererToHtmlElement(cellRendererPromise: Promise<ICellRendererComp>, eTarget: HTMLElement): void;
}
export declare class NumberSequence {
    private nextValue;
    private step;
    constructor(initValue?: number, step?: number);
    next(): number;
    peek(): number;
    skip(count: number): void;
}
export declare const _: typeof Utils;

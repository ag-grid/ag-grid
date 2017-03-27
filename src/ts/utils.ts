import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
var FUNCTION_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var FUNCTION_ARGUMENT_NAMES = /([^\s,]+)/g;

// util class, only used when debugging, for printing time to console
export class Timer {

    private timestamp = new Date().getTime();
    
    public print(msg: string) {
        var duration = (new Date().getTime()) - this.timestamp;
        console.log(`${msg} = ${duration}`);
        this.timestamp = new Date().getTime();
    }
    
}

/** HTML Escapes. */
const HTML_ESCAPES :{[id:string]:string}= {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

const reUnescapedHtml = /[&<>"']/g;


export class Utils {

    // taken from:
    // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    // both of these variables are lazy loaded, as otherwise they try and get initialised when we are loading
    // unit tests and we don't have references to window or document in the unit tests
    private static isSafari: boolean;
    private static isIE: boolean;
    private static isEdge: boolean;
    private static isChrome: boolean;
    private static isFirefox: boolean;

    // returns true if the event is close to the original event by X pixels either vertically or horizontally.
    // we only start dragging after X pixels so this allows us to know if we should start dragging yet.
    static areEventsNear(e1: MouseEvent|Touch, e2: MouseEvent|Touch, pixelCount: number): boolean {
        // by default, we wait 4 pixels before starting the drag
        if (pixelCount===0) {
            return false;
        }
        var diffX = Math.abs(e1.clientX - e2.clientX);
        var diffY = Math.abs(e1.clientY - e2.clientY);

        return Math.max(diffX, diffY) <= pixelCount;
    }

    static shallowCompare(arr1: any[], arr2: any[]): boolean {
        // if both are missing, then they are the same
        if (this.missing(arr1) && this.missing(arr2)) { return true; }
        // if one is present, but other is missing, then then are different
        if (this.missing(arr1) || this.missing(arr2)) { return false; }

        if (arr1.length!==arr2.length) { return false; }

        for (let i = 0; i<arr1.length; i++) {
            if (arr1[i]!==arr2[i]) {
                return false;
            }
        }

        return true;
    }

    static getNameOfClass(TheClass: any) {
        var funcNameRegex = /function (.{1,})\(/;
        var funcAsString = TheClass.toString();
        var results  = (funcNameRegex).exec(funcAsString);
        return (results && results.length > 1) ? results[1] : "";
    }

    static values<T>(object: {[key: string]: T}): T[] {
        var result: T[] = [];
        this.iterateObject(object, (key: string, value: T)=> {
            result.push(value);
        });
        return result;
    }

    static getValueUsingField(data: any, field: string, fieldContainsDots: boolean): any {
        if (!field || !data) {
            return;
        }
        // if no '.', then it's not a deep value
        if (!fieldContainsDots) {
            return data[field];
        } else {
            // otherwise it is a deep value, so need to dig for it
            var fields = field.split('.');
            var currentObject = data;
            for (var i = 0; i<fields.length; i++) {
                currentObject = currentObject[fields[i]];
                if (this.missing(currentObject)) {
                    return null;
                }
            }
            return currentObject;
        }
    }

    static getScrollLeft(element: HTMLElement, rtl: boolean): number {
        var scrollLeft = element.scrollLeft;
        if (rtl) {
            // Absolute value - for FF that reports RTL scrolls in negative numbers
            scrollLeft = Math.abs(scrollLeft);

            // Get Chrome and Safari to return the same value as well
            if (this.isBrowserSafari() || this.isBrowserChrome()) {
                scrollLeft = element.scrollWidth - element.clientWidth - scrollLeft;
            }
        }
        return scrollLeft;
    }

    static cleanNumber(value: any): number {
        if (typeof value === 'string') {
            value = parseInt(value);
        }
        if (typeof value === 'number') {
            value = Math.floor(value);
        } else {
            value = null;
        }
        return value;
    }

    static setScrollLeft(element: HTMLElement, value: number, rtl: boolean): void {
        if (rtl) {
            // Chrome and Safari when doing RTL have the END position of the scroll as zero, not the start
            if (this.isBrowserSafari() || this.isBrowserChrome()) {
                value = element.scrollWidth - element.clientWidth - value;
            }
            // Firefox uses negative numbers when doing RTL scrolling
            if (this.isBrowserFirefox()) {
                value *= -1;
            }
        }
        element.scrollLeft = value;
    }

    static iterateObject(object: any, callback: (key:string, value: any) => void) {
        if (this.missing(object)) { return; }
        var keys = Object.keys(object);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = object[key];
            callback(key, value);
        }
    }

    static cloneObject<T>(object: T): T {
        var copy = <T>{};
        var keys = Object.keys(object);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = (<any>object)[key];
            (<any>copy)[key] = value;
        }
        return copy;
    }

    static map<TItem, TResult>(array: TItem[], callback: (item: TItem) => TResult) {
        var result: TResult[] = [];
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            var mappedItem = callback(item);
            result.push(mappedItem);
        }
        return result;
    }

    static mapObject<TResult>(object: any, callback: (item: any) => TResult) {
        var result: TResult[] = [];
        Utils.iterateObject(object, (key: string, value: any)=> {
            result.push(callback(value));
        });
        return result;
    }

    static forEach<T>(array: T[], callback: (item: T, index: number) => void) {
        if (!array) {
            return;
        }

        for (var i = 0; i < array.length; i++) {
            var value = array[i];
            callback(value, i);
        }
    }

    static filter<T>(array: T[], callback: (item: T) => boolean): T[] {
        var result: T[] = [];
        array.forEach(function (item: T) {
            if (callback(item)) {
                result.push(item);
            }
        });
        return result;
    }


    static mergeDeep(object: any, source: any): void {
        if (this.exists(source)) {
            this.iterateObject(source, function(key: string, value: any) {
                let currentValue: any = object[key];
                let target: any = source[key];

                if (currentValue == null){
                    object[key] = value;
                }

                if (typeof currentValue === 'object'){
                    if (target){
                        Utils.mergeDeep (object[key], target)
                    }
                }

                if (target){
                    object[key] = target;
                }
            });
        }
    }

    static assign(object: any, source: any): void {
        if (this.exists(source)) {
            this.iterateObject(source, function(key: string, value: any) {
                object[key] = value;
            });
        }
    }

    static parseYyyyMmDdToDate (yyyyMmDd:string, separator:string):Date{
        try{
            if (!yyyyMmDd) return null;
            if (yyyyMmDd.indexOf(separator) === -1) return null;

            let fields:string[] = yyyyMmDd.split(separator);
            if (fields.length != 3) return null;
            return new Date (Number(fields[0]),Number(fields[1]) - 1,Number(fields[2]));
        }catch (e){
            return null;
        }
    }

    static serializeDateToYyyyMmDd (date:Date, separator:string):string {
        if (!date) return null;
        return date.getFullYear() + separator + Utils.pad(date.getMonth() + 1, 2) + separator + Utils.pad(date.getDate(), 2)
    }

    static pad(num: number, totalStringSize:number) : string{
        let asString:string = num + "";
        while (asString.length < totalStringSize) asString = "0" + asString;
        return asString;
    }

    static pushAll(target: any[], source: any[]): void {
        if (this.missing(source) || this.missing(target)) { return; }
        source.forEach( func => target.push(func) );
    }

    static getFunctionParameters(func: any) {
        var fnStr = func.toString().replace(FUNCTION_STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(FUNCTION_ARGUMENT_NAMES);
        if (result === null) {
            return [];
        } else {
            return result;
        }
    }

    static find<T>(collection: T[]| {[id:string]:T}, predicate: string |((item: T) => void), value?: any): T {
        if (collection === null || collection === undefined) {
            return null;
        }

        if (!Array.isArray(collection)) {
            let objToArray = this.values(collection);
            return this.find(objToArray, predicate, value);
        }

        let collectionAsArray = <T[]> collection;

        var firstMatchingItem: T;
        for (var i = 0; i < collectionAsArray.length; i++) {
            var item: T = collectionAsArray[i];
            if (typeof predicate === 'string') {
                if ((<any>item)[predicate] === value) {
                    firstMatchingItem = item;
                    break;
                }
            } else {
                var callback = <(item: T) => void> predicate;
                if (callback(item)) {
                    firstMatchingItem = item;
                    break;
                }
            }
        }
        return firstMatchingItem;
    }

    static toStrings<T>(array: T[]): string[] {
        return this.map(array, function (item) {
            if (item === undefined || item === null || !item.toString) {
                return null;
            } else {
                return item.toString();
            }
        });
    }

    static iterateArray<T>(array: T[], callback: (item: T, index: number) => void) {
        for (var index = 0; index < array.length; index++) {
            var value = array[index];
            callback(value, index);
        }
    }

    //Returns true if it is a DOM node
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    static isNode(o: any) {
        return (
            typeof Node === "function" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
        );
    }

    //Returns true if it is a DOM element
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    static isElement(o: any) {
        return (
            typeof HTMLElement === "function" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    }

    static isNodeOrElement(o: any) {
        return this.isNode(o) || this.isElement(o);
    }

    //adds all type of change listeners to an element, intended to be a text field
    static addChangeListener(element: HTMLElement, listener: EventListener) {
        element.addEventListener("changed", listener);
        element.addEventListener("paste", listener);
        element.addEventListener("input", listener);
        // IE doesn't fire changed for special keys (eg delete, backspace), so need to
        // listen for this further ones
        element.addEventListener("keydown", listener);
        element.addEventListener("keyup", listener);
    }

    //if value is undefined, null or blank, returns null, otherwise returns the value
    static makeNull(value: any) {
        if (value === null || value === undefined || value === "") {
            return null;
        } else {
            return value;
        }
    }

    static missing(value: any): boolean {
        return !this.exists(value);
    }

    static missingOrEmpty(value: any[]|string): boolean {
        return this.missing(value) || value.length === 0;
    }

    static missingOrEmptyObject(value: any): boolean {
        return this.missing(value) || Object.keys(value).length === 0;
    }

    static exists(value: any): boolean {
        if (value===null || value===undefined || value==='') {
            return false;
        } else {
            return true;
        }
    }

    static anyExists(values: any[]): boolean {
        if (values) {
            for (var i = 0; i<values.length; i++) {
                if (this.exists(values[i])) {
                    return true;
                }
            }
        }
        return false;
    }

    static existsAndNotEmpty(value: any[]): boolean {
        return this.exists(value) && value.length > 0;
    }

    static removeAllChildren(node: HTMLElement) {
        if (node) {
            while (node.hasChildNodes()) {
                node.removeChild(node.lastChild);
            }
        }
    }

    static removeElement(parent: HTMLElement, cssSelector: string) {
        this.removeFromParent(parent.querySelector(cssSelector));
    }

    static removeFromParent(node: Element) {
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }

    static isVisible(element: HTMLElement) {
        return (element.offsetParent !== null);
    }

    /**
     * loads the template and returns it as an element. makes up for no simple way in
     * the dom api to load html directly, eg we cannot do this: document.createElement(template)
     */
    static loadTemplate(template: string): HTMLElement {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = template;
        return <HTMLElement> tempDiv.firstChild;
    }

    static addOrRemoveCssClass(element: HTMLElement, className: string, addOrRemove: boolean) {
        if (addOrRemove) {
            this.addCssClass(element, className);
        } else {
            this.removeCssClass(element, className);
        }
    }

    static callIfPresent(func: Function): void {
        if (func) {
            func();
        }
    }

    static addCssClass(element: HTMLElement, className: string) {
        if (!className || className.length===0) { return; }
        if (className.indexOf(' ') >= 0) {
            className.split(' ').forEach( value => this.addCssClass(element, value));
            return;
        }
        if (element.classList) {
            element.classList.add(className);
        } else {
            if (element.className && element.className.length > 0) {
                var cssClasses = element.className.split(' ');
                if (cssClasses.indexOf(className) < 0) {
                    cssClasses.push(className);
                    element.className = cssClasses.join(' ');
                }
            } else {
                element.className = className;
            }
        }
    }

    static containsClass(element: any, className: string): boolean {
        if (element.classList) {
            // for modern browsers
            return element.classList.contains(className);
        } else if (element.className) {
            // for older browsers, check against the string of class names
            // if only one class, can check for exact match
            var onlyClass = element.className === className;
            // if many classes, check for class name, we have to pad with ' ' to stop other
            // class names that are a substring of this class
            var contains = element.className.indexOf(' ' + className + ' ') >= 0;
            // the padding above then breaks when it's the first or last class names
            var startsWithClass = element.className.indexOf(className + ' ')===0;
            var endsWithClass = element.className.lastIndexOf(' ' + className) === (element.className.length - className.length -1);
            return onlyClass || contains || startsWithClass || endsWithClass;
        } else {
            // if item is not a node
            return false;
        }
    }

    static getElementAttribute(element: any, attributeName: string): string {
        if (element.attributes) {
            if (element.attributes[attributeName]) {
                var attribute = element.attributes[attributeName];
                return attribute.value;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    
    static offsetHeight(element: HTMLElement) {
        return element && element.clientHeight ? element.clientHeight : 0;
    }

    static offsetWidth(element: HTMLElement) {
        return element && element.clientWidth ? element.clientWidth : 0;
    }

    static removeCssClass(element: HTMLElement, className: string) {
        if (element.className && element.className.length > 0) {
            var cssClasses = element.className.split(' ');
            var index = cssClasses.indexOf(className);
            if (index >= 0) {
                cssClasses.splice(index, 1);
                element.className = cssClasses.join(' ');
            }
        }
    }

    static removeRepeatsFromArray<T>(array: T[], object: T) {
        if (!array) { return; }
        for (var index = array.length - 2; index >= 0; index--) {
            var thisOneMatches = array[index]===object;
            var nextOneMatches = array[index+1]===object;
            if (thisOneMatches && nextOneMatches) {
                array.splice(index+1, 1);
            }
        }

    }

    static removeFromArray<T>(array: T[], object: T) {
        if (array.indexOf(object) >= 0) {
            array.splice(array.indexOf(object), 1);
        }
    }

    static removeAllFromArray<T>(array: T[], toRemove: T[]) {
        toRemove.forEach( item => {
            if (array.indexOf(item) >= 0) {
                array.splice(array.indexOf(item), 1);
            }
        });
    }

    static insertIntoArray<T>(array: T[], object: T, toIndex: number) {
        array.splice(toIndex, 0, object);
    }

    static insertArrayIntoArray<T>(dest: T[], src: T[], toIndex: number) {
        if (this.missing(dest) || this.missing(src)) { return; }
        // put items in backwards, otherwise inserted items end up in reverse order
        for (let i = src.length - 1; i>=0; i--) {
            var item = src[i];
            this.insertIntoArray(dest, item, toIndex);
        }
    }

    static moveInArray<T>(array: T[], objectsToMove: T[], toIndex: number) {
        // first take out it items from the array
        objectsToMove.forEach( (obj)=> {
            this.removeFromArray(array, obj);
        });

        // now add the objects, in same order as provided to us, that means we start at the end
        // as the objects will be pushed to the right as they are inserted
        objectsToMove.slice().reverse().forEach( (obj)=> {
            this.insertIntoArray(array, obj, toIndex);
        });
    }
    
    static defaultComparator(valueA: any, valueB: any): number {
        var valueAMissing = valueA === null || valueA === undefined;
        var valueBMissing = valueB === null || valueB === undefined;
        if (valueAMissing && valueBMissing) {
            return 0;
        }
        if (valueAMissing) {
            return -1;
        }
        if (valueBMissing) {
            return 1;
        }

        if (typeof valueA === "string") {
            try {
                // using local compare also allows chinese comparisons
                return valueA.localeCompare(valueB);
            } catch (e) {
                // if something wrong with localeCompare, eg not supported
                // by browser, then just continue without using it
            }
        }

        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }
    }

    static compareArrays(array1: any[], array2: any[]): boolean {
        if (this.missing(array1) && this.missing(array2)) {
            return true;
        }
        if (this.missing(array1) || this.missing(array2)) {
            return false;
        }
        if (array1.length !== array2.length) {
            return false;
        }
        for (var i = 0; i<array1.length; i++) {
            if (array1[i]!==array2[i]) {
                return false;
            }
        }
        return true;
    }

    static toStringOrNull(value: any): string {
        if (this.exists(value) && value.toString) {
            return value.toString();
        } else {
            return null;
        }
    }

    static formatWidth(width: number | string) {
        if (typeof width === "number") {
            return width + "px";
        } else {
            return width;
        }
    }

    static formatNumberTwoDecimalPlacesAndCommas(value: number): string {
        if (typeof value !== 'number') { return ''; }

        // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
        return (Math.round(value * 100) / 100).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    // the native method number.toLocaleString(undefined, {minimumFractionDigits: 0}) puts in decimal places in IE,
    // so we use this method instead
    static formatNumberCommas(value: number): string {
        if (typeof value !== 'number') { return ''; }

        // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
        return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    static prependDC(parent: HTMLElement, documentFragment: DocumentFragment): void {
        if (this.exists(parent.firstChild)) {
            parent.insertBefore(documentFragment, parent.firstChild);
        } else {
            parent.appendChild(documentFragment);
        }
    }

    // static prepend(parent: HTMLElement, child: HTMLElement): void {
    //     if (this.exists(parent.firstChild)) {
    //         parent.insertBefore(child, parent.firstChild);
    //     } else {
    //         parent.appendChild(child);
    //     }
    // }

    /**
     * If icon provided, use this (either a string, or a function callback).
     * if not, then use the second parameter, which is the svgFactory function
     */
    static createIcon(iconName: string, gridOptionsWrapper: GridOptionsWrapper, column: Column, svgFactoryFunc: () => HTMLElement): HTMLElement {
        var eResult = document.createElement('span');
        eResult.appendChild(this.createIconNoSpan(iconName, gridOptionsWrapper, column, svgFactoryFunc));
        return eResult;
    }

    static createIconNoSpan(iconName: string, gridOptionsWrapper: GridOptionsWrapper, column: Column, svgFactoryFunc: () => HTMLElement): HTMLElement {
        var userProvidedIcon: Function | string;
        // check col for icon first
        if (column && column.getColDef().icons) {
            userProvidedIcon = column.getColDef().icons[iconName];
        }
        // it not in col, try grid options
        if (!userProvidedIcon && gridOptionsWrapper.getIcons()) {
            userProvidedIcon = gridOptionsWrapper.getIcons()[iconName];
        }
        // now if user provided, use it
        if (userProvidedIcon) {
            var rendererResult: any;
            if (typeof userProvidedIcon === 'function') {
                rendererResult = userProvidedIcon();
            } else if (typeof userProvidedIcon === 'string') {
                rendererResult = userProvidedIcon;
            } else {
                throw 'icon from grid options needs to be a string or a function';
            }
            if (typeof rendererResult === 'string') {
                return this.loadTemplate(rendererResult);
            } else if (this.isNodeOrElement(rendererResult)) {
                return rendererResult;
            } else {
                throw 'iconRenderer should return back a string or a dom object';
            }
        } else {
            // otherwise we use the built in icon
            if (svgFactoryFunc) {
                return svgFactoryFunc();
            } else {
                return null;
            }
        }
    }

    static addStylesToElement(eElement: any, styles: any) {
        if (!styles) { return; }
        Object.keys(styles).forEach(function (key) {
            eElement.style[key] = styles[key];
        });
    }

    static isHorizontalScrollShowing(element: HTMLElement): boolean {
        return element.clientWidth < element.scrollWidth;
    }

    static isVerticalScrollShowing(element: HTMLElement): boolean {
        return element.clientHeight < element.scrollHeight;
    }

    static getScrollbarWidth() {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = "scroll";

        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        // remove divs
        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    }

    static isKeyPressed(event: KeyboardEvent, keyToCheck: number) {
        var pressedKey = event.which || event.keyCode;
        return pressedKey === keyToCheck;
    }

    static setVisible(element: HTMLElement, visible: boolean) {
        this.addOrRemoveCssClass(element, 'ag-hidden', !visible);
    }

    static setHidden(element: HTMLElement, hidden: boolean) {
        this.addOrRemoveCssClass(element, 'ag-visibility-hidden', hidden);
    }

    static isBrowserIE(): boolean {
        if (this.isIE===undefined) {
            this.isIE = /*@cc_on!@*/false || !!(<any>document).documentMode; // At least IE6
        }
        return this.isIE;
    }

    static isBrowserEdge(): boolean {
        if (this.isEdge===undefined) {
            this.isEdge = !this.isBrowserIE() && !!(<any>window).StyleMedia;
        }
        return this.isEdge;
    }

    static isBrowserSafari(): boolean {
        if (this.isSafari===undefined) {
            let anyWindow = <any> window;
            // taken from https://github.com/ceolter/ag-grid/issues/550
            this.isSafari = Object.prototype.toString.call(anyWindow.HTMLElement).indexOf('Constructor') > 0
                || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })
                (!anyWindow.safari || anyWindow.safari.pushNotification);
        }
        return this.isSafari;
    }

    static isBrowserChrome(): boolean {
        if (this.isChrome===undefined) {
            let anyWindow = <any> window;
            this.isChrome = !!anyWindow.chrome && !!anyWindow.chrome.webstore;
        }
        return this.isChrome;
    }

    static isBrowserFirefox(): boolean {
        if (this.isFirefox===undefined) {
            let anyWindow = <any> window;
            this.isFirefox = typeof anyWindow.InstallTrigger !== 'undefined';;
        }
        return this.isFirefox;
    }

    // srcElement is only available in IE. In all other browsers it is target
    // http://stackoverflow.com/questions/5301643/how-can-i-make-event-srcelement-work-in-firefox-and-what-does-it-mean
    static getTarget(event: Event): Element {
        var eventNoType = <any> event;
        return eventNoType.target || eventNoType.srcElement;
    }

    // taken from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
    static getBodyWidth(): number {
        if (document.body) {
            return document.body.clientWidth;
        }

        if (window.innerHeight) {
            return window.innerWidth;
        }

        if (document.documentElement && document.documentElement.clientWidth) {
            return document.documentElement.clientWidth;
        }

        return -1;
    }

    // taken from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
    static getBodyHeight(): number {
        if (document.body) {
            return document.body.clientHeight;
        }

        if (window.innerHeight) {
            return window.innerHeight;
        }

        if (document.documentElement && document.documentElement.clientHeight) {
            return document.documentElement.clientHeight;
        }

        return -1;
    }

    static setCheckboxState(eCheckbox: any, state: any) {
        if (typeof state === 'boolean') {
            eCheckbox.checked = state;
            eCheckbox.indeterminate = false;
        } else {
            // isNodeSelected returns back undefined if it's a group and the children
            // are a mix of selected and unselected
            eCheckbox.indeterminate = true;
        }
    }

    static traverseNodesWithKey(nodes: RowNode[], callback: (node: RowNode, key: string)=>void): void {
        var keyParts: any[] = [];

        recursiveSearchNodes(nodes);

        function recursiveSearchNodes(nodes: RowNode[]): void {
            nodes.forEach( (node: RowNode) => {
                if (node.group) {
                    keyParts.push(node.key);
                    var key = keyParts.join('|');
                    callback(node, key);
                    recursiveSearchNodes(node.childrenAfterGroup);
                    keyParts.pop();
                }
            });
        }
    }

    /**
     * From http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
     */
    static isNumeric (value:any): boolean {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    static escape (toEscape:string):string {
        if (toEscape === null) return null;
        if (!toEscape.replace) return toEscape;

        return toEscape.replace(reUnescapedHtml, chr => HTML_ESCAPES[chr])
    }

    // Taken from here: https://github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
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
    static normalizeWheel(event:any): any {
        var PIXEL_STEP  = 10;
        var LINE_HEIGHT = 40;
        var PAGE_HEIGHT = 800;

        // spinX, spinY
        var sX = 0;
        var sY = 0;

        // pixelX, pixelY
        var pX = 0;
        var pY = 0;

        // Legacy
        if ('detail'      in event) { sY = event.detail; }
        if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
        if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
        if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

        // side scrolling on FF with DOMMouseScroll
        if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
            sX = sY;
            sY = 0;
        }

        pX = sX * PIXEL_STEP;
        pY = sY * PIXEL_STEP;

        if ('deltaY' in event) { pY = event.deltaY; }
        if ('deltaX' in event) { pX = event.deltaX; }

        if ((pX || pY) && event.deltaMode) {
            if (event.deltaMode == 1) {          // delta in LINE units
                pX *= LINE_HEIGHT;
                pY *= LINE_HEIGHT;
            } else {                             // delta in PAGE units
                pX *= PAGE_HEIGHT;
                pY *= PAGE_HEIGHT;
            }
        }

        // Fall-back if spin cannot be determined
        if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
        if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

        return { spinX  : sX,
            spinY  : sY,
            pixelX : pX,
            pixelY : pY };
    }
}

export class NumberSequence {

    private nextValue: number;
    private step: number;

    constructor(initValue = 0, step = 1) {
        this.nextValue = initValue;
        this.step = step;
    }

    public next() : number {
        var valToReturn = this.nextValue;
        this.nextValue += this.step;
        return valToReturn;
    }
}

export let _ = Utils;
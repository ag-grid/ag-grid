/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var FUNCTION_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var FUNCTION_ARGUMENT_NAMES = /([^\s,]+)/g;
var AG_GRID_STOP_PROPAGATION = '__ag_Grid_Stop_Propagation';
// util class, only used when debugging, for printing time to console
var Timer = (function () {
    function Timer() {
        this.timestamp = new Date().getTime();
    }
    Timer.prototype.print = function (msg) {
        var duration = (new Date().getTime()) - this.timestamp;
        console.log(msg + " = " + duration);
        this.timestamp = new Date().getTime();
    };
    return Timer;
}());
exports.Timer = Timer;
/** HTML Escapes. */
var HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};
var reUnescapedHtml = /[&<>"']/g;
var Utils = (function () {
    function Utils() {
    }
    // if the key was passed before, then doesn't execute the func
    Utils.doOnce = function (func, key) {
        if (this.doOnceFlags[key]) {
            return;
        }
        func();
        this.doOnceFlags[key] = true;
    };
    // returns true if the event is close to the original event by X pixels either vertically or horizontally.
    // we only start dragging after X pixels so this allows us to know if we should start dragging yet.
    Utils.areEventsNear = function (e1, e2, pixelCount) {
        // by default, we wait 4 pixels before starting the drag
        if (pixelCount === 0) {
            return false;
        }
        var diffX = Math.abs(e1.clientX - e2.clientX);
        var diffY = Math.abs(e1.clientY - e2.clientY);
        return Math.max(diffX, diffY) <= pixelCount;
    };
    Utils.shallowCompare = function (arr1, arr2) {
        // if both are missing, then they are the same
        if (this.missing(arr1) && this.missing(arr2)) {
            return true;
        }
        // if one is present, but other is missing, then then are different
        if (this.missing(arr1) || this.missing(arr2)) {
            return false;
        }
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (var i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    };
    Utils.getNameOfClass = function (TheClass) {
        var funcNameRegex = /function (.{1,})\(/;
        var funcAsString = TheClass.toString();
        var results = (funcNameRegex).exec(funcAsString);
        return (results && results.length > 1) ? results[1] : "";
    };
    Utils.values = function (object) {
        var result = [];
        this.iterateObject(object, function (key, value) {
            result.push(value);
        });
        return result;
    };
    Utils.getValueUsingField = function (data, field, fieldContainsDots) {
        if (!field || !data) {
            return;
        }
        // if no '.', then it's not a deep value
        if (!fieldContainsDots) {
            return data[field];
        }
        else {
            // otherwise it is a deep value, so need to dig for it
            var fields = field.split('.');
            var currentObject = data;
            for (var i = 0; i < fields.length; i++) {
                currentObject = currentObject[fields[i]];
                if (this.missing(currentObject)) {
                    return null;
                }
            }
            return currentObject;
        }
    };
    Utils.getScrollLeft = function (element, rtl) {
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
    };
    Utils.cleanNumber = function (value) {
        if (typeof value === 'string') {
            value = parseInt(value);
        }
        if (typeof value === 'number') {
            value = Math.floor(value);
        }
        else {
            value = null;
        }
        return value;
    };
    Utils.setScrollLeft = function (element, value, rtl) {
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
    };
    Utils.iterateObject = function (object, callback) {
        if (this.missing(object)) {
            return;
        }
        var keys = Object.keys(object);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = object[key];
            callback(key, value);
        }
    };
    Utils.cloneObject = function (object) {
        var copy = {};
        var keys = Object.keys(object);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = object[key];
            copy[key] = value;
        }
        return copy;
    };
    Utils.map = function (array, callback) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            var mappedItem = callback(item);
            result.push(mappedItem);
        }
        return result;
    };
    Utils.mapObject = function (object, callback) {
        var result = [];
        Utils.iterateObject(object, function (key, value) {
            result.push(callback(value));
        });
        return result;
    };
    Utils.forEach = function (array, callback) {
        if (!array) {
            return;
        }
        for (var i = 0; i < array.length; i++) {
            var value = array[i];
            callback(value, i);
        }
    };
    Utils.filter = function (array, callback) {
        var result = [];
        array.forEach(function (item) {
            if (callback(item)) {
                result.push(item);
            }
        });
        return result;
    };
    Utils.getAllKeysInObjects = function (objects) {
        var allValues = {};
        objects.forEach(function (obj) {
            if (obj) {
                Object.keys(obj).forEach(function (key) { return allValues[key] = null; });
            }
        });
        return Object.keys(allValues);
    };
    Utils.mergeDeep = function (dest, source) {
        if (this.exists(source)) {
            this.iterateObject(source, function (key, newValue) {
                var oldValue = dest[key];
                if (oldValue === newValue) {
                    return;
                }
                if (typeof oldValue === 'object' && typeof newValue === 'object') {
                    Utils.mergeDeep(oldValue, newValue);
                }
                else {
                    dest[key] = newValue;
                }
            });
        }
    };
    Utils.assign = function (object) {
        var _this = this;
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        sources.forEach(function (source) {
            if (_this.exists(source)) {
                _this.iterateObject(source, function (key, value) {
                    object[key] = value;
                });
            }
        });
        return object;
    };
    Utils.parseYyyyMmDdToDate = function (yyyyMmDd, separator) {
        try {
            if (!yyyyMmDd)
                return null;
            if (yyyyMmDd.indexOf(separator) === -1)
                return null;
            var fields = yyyyMmDd.split(separator);
            if (fields.length != 3)
                return null;
            return new Date(Number(fields[0]), Number(fields[1]) - 1, Number(fields[2]));
        }
        catch (e) {
            return null;
        }
    };
    Utils.serializeDateToYyyyMmDd = function (date, separator) {
        if (!date)
            return null;
        return date.getFullYear() + separator + Utils.pad(date.getMonth() + 1, 2) + separator + Utils.pad(date.getDate(), 2);
    };
    Utils.pad = function (num, totalStringSize) {
        var asString = num + "";
        while (asString.length < totalStringSize)
            asString = "0" + asString;
        return asString;
    };
    Utils.pushAll = function (target, source) {
        if (this.missing(source) || this.missing(target)) {
            return;
        }
        source.forEach(function (func) { return target.push(func); });
    };
    Utils.createArrayOfNumbers = function (first, last) {
        var result = [];
        for (var i = first; i <= last; i++) {
            result.push(i);
        }
        return result;
    };
    Utils.getFunctionParameters = function (func) {
        var fnStr = func.toString().replace(FUNCTION_STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(FUNCTION_ARGUMENT_NAMES);
        if (result === null) {
            return [];
        }
        else {
            return result;
        }
    };
    Utils.find = function (collection, predicate, value) {
        if (collection === null || collection === undefined) {
            return null;
        }
        if (!Array.isArray(collection)) {
            var objToArray = this.values(collection);
            return this.find(objToArray, predicate, value);
        }
        var collectionAsArray = collection;
        var firstMatchingItem;
        for (var i = 0; i < collectionAsArray.length; i++) {
            var item = collectionAsArray[i];
            if (typeof predicate === 'string') {
                if (item[predicate] === value) {
                    firstMatchingItem = item;
                    break;
                }
            }
            else {
                var callback = predicate;
                if (callback(item)) {
                    firstMatchingItem = item;
                    break;
                }
            }
        }
        return firstMatchingItem;
    };
    Utils.toStrings = function (array) {
        return this.map(array, function (item) {
            if (item === undefined || item === null || !item.toString) {
                return null;
            }
            else {
                return item.toString();
            }
        });
    };
    Utils.iterateArray = function (array, callback) {
        for (var index = 0; index < array.length; index++) {
            var value = array[index];
            callback(value, index);
        }
    };
    //Returns true if it is a DOM node
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    Utils.isNode = function (o) {
        return (typeof Node === "function" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
    };
    //Returns true if it is a DOM element
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    Utils.isElement = function (o) {
        return (typeof HTMLElement === "function" ? o instanceof HTMLElement :
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string");
    };
    Utils.isNodeOrElement = function (o) {
        return this.isNode(o) || this.isElement(o);
    };
    Utils.isEventFromPrintableCharacter = function (event) {
        var pressedChar = String.fromCharCode(event.charCode);
        // newline is an exception, as it counts as a printable character, but we don't
        // want to start editing when it is pressed. without this check, if user is in chrome
        // and editing a cell, and they press ctrl+enter, the cell stops editing, and then
        // starts editing again with a blank value (two 'key down' events are fired). to
        // test this, remove the line below, edit a cell in chrome and hit ctrl+enter while editing.
        // https://ag-grid.atlassian.net/browse/AG-605
        if (this.isKeyPressed(event, constants_1.Constants.KEY_NEW_LINE)) {
            return false;
        }
        if (exports._.exists(event.key)) {
            // modern browser will implement key, so we return if key is length 1, eg if it is 'a' for the
            // a key, or '2' for the '2' key. non-printable characters have names, eg 'Enter' or 'Backspace'.
            return event.key.length === 1;
        }
        else {
            // otherwise, for older browsers, we test against a list of characters, which doesn't include
            // accents for non-English, but don't care much, as most users are on modern browsers
            return Utils.PRINTABLE_CHARACTERS.indexOf(pressedChar) >= 0;
        }
    };
    //adds all type of change listeners to an element, intended to be a text field
    Utils.addChangeListener = function (element, listener) {
        element.addEventListener("changed", listener);
        element.addEventListener("paste", listener);
        element.addEventListener("input", listener);
        // IE doesn't fire changed for special keys (eg delete, backspace), so need to
        // listen for this further ones
        element.addEventListener("keydown", listener);
        element.addEventListener("keyup", listener);
    };
    //if value is undefined, null or blank, returns null, otherwise returns the value
    Utils.makeNull = function (value) {
        var valueNoType = value;
        if (value === null || value === undefined || valueNoType === "") {
            return null;
        }
        else {
            return value;
        }
    };
    Utils.missing = function (value) {
        return !this.exists(value);
    };
    Utils.missingOrEmpty = function (value) {
        return this.missing(value) || value.length === 0;
    };
    Utils.missingOrEmptyObject = function (value) {
        return this.missing(value) || Object.keys(value).length === 0;
    };
    Utils.exists = function (value) {
        if (value === null || value === undefined || value === '') {
            return false;
        }
        else {
            return true;
        }
    };
    Utils.firstExistingValue = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            if (exports._.exists(value))
                return value;
        }
        return null;
    };
    Utils.anyExists = function (values) {
        if (values) {
            for (var i = 0; i < values.length; i++) {
                if (this.exists(values[i])) {
                    return true;
                }
            }
        }
        return false;
    };
    Utils.existsAndNotEmpty = function (value) {
        return this.exists(value) && value.length > 0;
    };
    Utils.removeAllChildren = function (node) {
        if (node) {
            while (node.hasChildNodes()) {
                node.removeChild(node.lastChild);
            }
        }
    };
    Utils.removeElement = function (parent, cssSelector) {
        this.removeFromParent(parent.querySelector(cssSelector));
    };
    Utils.removeFromParent = function (node) {
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    };
    Utils.isVisible = function (element) {
        return (element.offsetParent !== null);
    };
    /**
     * loads the template and returns it as an element. makes up for no simple way in
     * the dom api to load html directly, eg we cannot do this: document.createElement(template)
     */
    Utils.loadTemplate = function (template) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = template;
        return tempDiv.firstChild;
    };
    Utils.appendHtml = function (eContainer, htmlTemplate) {
        if (eContainer.lastChild) {
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
            // we put the items at the start, so new items appear underneath old items,
            // so when expanding/collapsing groups, the new rows don't go on top of the
            // rows below that are moving our of the way
            eContainer.insertAdjacentHTML('afterbegin', htmlTemplate);
        }
        else {
            eContainer.innerHTML = htmlTemplate;
        }
    };
    Utils.addOrRemoveCssClass = function (element, className, addOrRemove) {
        if (addOrRemove) {
            this.addCssClass(element, className);
        }
        else {
            this.removeCssClass(element, className);
        }
    };
    Utils.callIfPresent = function (func) {
        if (func) {
            func();
        }
    };
    Utils.addCssClass = function (element, className) {
        var _this = this;
        if (!className || className.length === 0) {
            return;
        }
        if (className.indexOf(' ') >= 0) {
            className.split(' ').forEach(function (value) { return _this.addCssClass(element, value); });
            return;
        }
        if (element.classList) {
            if (!element.classList.contains(className)) {
                element.classList.add(className);
            }
        }
        else {
            if (element.className && element.className.length > 0) {
                var cssClasses = element.className.split(' ');
                if (cssClasses.indexOf(className) < 0) {
                    cssClasses.push(className);
                    element.className = cssClasses.join(' ');
                }
            }
            else {
                element.className = className;
            }
        }
    };
    Utils.containsClass = function (element, className) {
        if (element.classList) {
            // for modern browsers
            return element.classList.contains(className);
        }
        else if (element.className) {
            // for older browsers, check against the string of class names
            // if only one class, can check for exact match
            var onlyClass = element.className === className;
            // if many classes, check for class name, we have to pad with ' ' to stop other
            // class names that are a substring of this class
            var contains = element.className.indexOf(' ' + className + ' ') >= 0;
            // the padding above then breaks when it's the first or last class names
            var startsWithClass = element.className.indexOf(className + ' ') === 0;
            var endsWithClass = element.className.lastIndexOf(' ' + className) === (element.className.length - className.length - 1);
            return onlyClass || contains || startsWithClass || endsWithClass;
        }
        else {
            // if item is not a node
            return false;
        }
    };
    Utils.getElementAttribute = function (element, attributeName) {
        if (element.attributes) {
            if (element.attributes[attributeName]) {
                var attribute = element.attributes[attributeName];
                return attribute.value;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };
    Utils.offsetHeight = function (element) {
        return element && element.clientHeight ? element.clientHeight : 0;
    };
    Utils.offsetWidth = function (element) {
        return element && element.clientWidth ? element.clientWidth : 0;
    };
    Utils.sortNumberArray = function (numberArray) {
        numberArray.sort(function (a, b) { return a - b; });
    };
    Utils.removeCssClass = function (element, className) {
        if (element.classList) {
            if (element.classList.contains(className)) {
                element.classList.remove(className);
            }
        }
        else {
            if (element.className && element.className.length > 0) {
                var cssClasses = element.className.split(' ');
                if (cssClasses.indexOf(className) >= 0) {
                    // remove all instances of the item, not just the first, in case it's in more than once
                    while (cssClasses.indexOf(className) >= 0) {
                        cssClasses.splice(cssClasses.indexOf(className), 1);
                    }
                    element.className = cssClasses.join(' ');
                }
            }
        }
    };
    Utils.removeRepeatsFromArray = function (array, object) {
        if (!array) {
            return;
        }
        for (var index = array.length - 2; index >= 0; index--) {
            var thisOneMatches = array[index] === object;
            var nextOneMatches = array[index + 1] === object;
            if (thisOneMatches && nextOneMatches) {
                array.splice(index + 1, 1);
            }
        }
    };
    Utils.removeFromArray = function (array, object) {
        if (array.indexOf(object) >= 0) {
            array.splice(array.indexOf(object), 1);
        }
    };
    Utils.removeAllFromArray = function (array, toRemove) {
        toRemove.forEach(function (item) {
            if (array.indexOf(item) >= 0) {
                array.splice(array.indexOf(item), 1);
            }
        });
    };
    Utils.insertIntoArray = function (array, object, toIndex) {
        array.splice(toIndex, 0, object);
    };
    Utils.insertArrayIntoArray = function (dest, src, toIndex) {
        if (this.missing(dest) || this.missing(src)) {
            return;
        }
        // put items in backwards, otherwise inserted items end up in reverse order
        for (var i = src.length - 1; i >= 0; i--) {
            var item = src[i];
            this.insertIntoArray(dest, item, toIndex);
        }
    };
    Utils.moveInArray = function (array, objectsToMove, toIndex) {
        var _this = this;
        // first take out it items from the array
        objectsToMove.forEach(function (obj) {
            _this.removeFromArray(array, obj);
        });
        // now add the objects, in same order as provided to us, that means we start at the end
        // as the objects will be pushed to the right as they are inserted
        objectsToMove.slice().reverse().forEach(function (obj) {
            _this.insertIntoArray(array, obj, toIndex);
        });
    };
    Utils.defaultComparator = function (valueA, valueB, accentedCompare) {
        if (accentedCompare === void 0) { accentedCompare = false; }
        var valueAMissing = valueA === null || valueA === undefined;
        var valueBMissing = valueB === null || valueB === undefined;
        // this is for aggregations sum and avg, where the result can be a number that is wrapped.
        // if we didn't do this, then the toString() value would be used, which would result in
        // the strings getting used instead of the numbers.
        if (valueA && valueA.toNumber) {
            valueA = valueA.toNumber();
        }
        if (valueB && valueB.toNumber) {
            valueB = valueB.toNumber();
        }
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
            if (!accentedCompare) {
                return doQuickCompare(valueA, valueB);
            }
            else {
                try {
                    // using local compare also allows chinese comparisons
                    return valueA.localeCompare(valueB);
                }
                catch (e) {
                    // if something wrong with localeCompare, eg not supported
                    // by browser, then just continue with the quick one
                    return doQuickCompare(valueA, valueB);
                }
            }
        }
        if (valueA < valueB) {
            return -1;
        }
        else if (valueA > valueB) {
            return 1;
        }
        else {
            return 0;
        }
        function doQuickCompare(a, b) {
            return (a > b ? 1 : (a < b ? -1 : 0));
        }
    };
    Utils.compareArrays = function (array1, array2) {
        if (this.missing(array1) && this.missing(array2)) {
            return true;
        }
        if (this.missing(array1) || this.missing(array2)) {
            return false;
        }
        if (array1.length !== array2.length) {
            return false;
        }
        for (var i = 0; i < array1.length; i++) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    };
    Utils.ensureDomOrder = function (eContainer, eChild, eChildBefore) {
        // if already in right order, do nothing
        if (eChildBefore && eChildBefore.nextSibling === eChild) {
            return;
        }
        if (eChildBefore) {
            if (eChildBefore.nextSibling) {
                // insert between the eRowBefore and the row after it
                eContainer.insertBefore(eChild, eChildBefore.nextSibling);
            }
            else {
                // if nextSibling is missing, means other row is at end, so just append new row at the end
                eContainer.appendChild(eChild);
            }
        }
        else {
            // otherwise put at start
            if (eContainer.firstChild) {
                // insert it at the first location
                eContainer.insertBefore(eChild, eContainer.firstChild);
            }
        }
    };
    Utils.insertWithDomOrder = function (eContainer, eChild, eChildBefore) {
        if (eChildBefore) {
            if (eChildBefore.nextSibling) {
                // insert between the eRowBefore and the row after it
                eContainer.insertBefore(eChild, eChildBefore.nextSibling);
            }
            else {
                // if nextSibling is missing, means other row is at end, so just append new row at the end
                eContainer.appendChild(eChild);
            }
        }
        else {
            if (eContainer.firstChild) {
                // insert it at the first location
                eContainer.insertBefore(eChild, eContainer.firstChild);
            }
            else {
                // otherwise eContainer is empty, so just append it
                eContainer.appendChild(eChild);
            }
        }
    };
    Utils.insertTemplateWithDomOrder = function (eContainer, htmlTemplate, eChildBefore) {
        var res;
        if (eChildBefore) {
            // if previous element exists, just slot in after the previous element
            eChildBefore.insertAdjacentHTML('afterend', htmlTemplate);
            res = eChildBefore.nextSibling;
        }
        else {
            if (eContainer.firstChild) {
                // insert it at the first location
                eContainer.insertAdjacentHTML('afterbegin', htmlTemplate);
            }
            else {
                // otherwise eContainer is empty, so just append it
                eContainer.innerHTML = htmlTemplate;
            }
            res = eContainer.firstChild;
        }
        return res;
    };
    Utils.toStringOrNull = function (value) {
        if (this.exists(value) && value.toString) {
            return value.toString();
        }
        else {
            return null;
        }
    };
    Utils.formatWidth = function (width) {
        if (typeof width === "number") {
            return width + "px";
        }
        else {
            return width;
        }
    };
    Utils.formatNumberTwoDecimalPlacesAndCommas = function (value) {
        if (typeof value !== 'number') {
            return '';
        }
        // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
        return (Math.round(value * 100) / 100).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    };
    // the native method number.toLocaleString(undefined, {minimumFractionDigits: 0}) puts in decimal places in IE,
    // so we use this method instead
    Utils.formatNumberCommas = function (value) {
        if (typeof value !== 'number') {
            return '';
        }
        // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
        return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    };
    Utils.prependDC = function (parent, documentFragment) {
        if (this.exists(parent.firstChild)) {
            parent.insertBefore(documentFragment, parent.firstChild);
        }
        else {
            parent.appendChild(documentFragment);
        }
    };
    /**
     * If icon provided, use this (either a string, or a function callback).
     * if not, then use the default icon from the theme
     */
    Utils.createIcon = function (iconName, gridOptionsWrapper, column) {
        var iconContents = this.createIconNoSpan(iconName, gridOptionsWrapper, column);
        if (iconContents.className.indexOf('ag-icon') > -1) {
            return iconContents;
        }
        else {
            var eResult = document.createElement('span');
            eResult.appendChild(iconContents);
            return eResult;
        }
    };
    Utils.createIconNoSpan = function (iconName, gridOptionsWrapper, column) {
        var userProvidedIcon;
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
            var rendererResult = void 0;
            if (typeof userProvidedIcon === 'function') {
                rendererResult = userProvidedIcon();
            }
            else if (typeof userProvidedIcon === 'string') {
                rendererResult = userProvidedIcon;
            }
            else {
                throw 'icon from grid options needs to be a string or a function';
            }
            if (typeof rendererResult === 'string') {
                return this.loadTemplate(rendererResult);
            }
            else if (this.isNodeOrElement(rendererResult)) {
                return rendererResult;
            }
            else {
                throw 'iconRenderer should return back a string or a dom object';
            }
        }
        else {
            var span = document.createElement('span');
            var cssClass = this.iconNameClassMap[iconName];
            if (!cssClass) {
                throw new Error(iconName + " did not find class");
            }
            span.setAttribute("class", "ag-icon ag-icon-" + cssClass);
            return span;
        }
    };
    Utils.addStylesToElement = function (eElement, styles) {
        var _this = this;
        if (!styles) {
            return;
        }
        Object.keys(styles).forEach(function (key) {
            var keyCamelCase = _this.hyphenToCamelCase(key);
            eElement.style[keyCamelCase] = styles[key];
        });
    };
    Utils.isHorizontalScrollShowing = function (element) {
        return element.clientWidth < element.scrollWidth;
    };
    Utils.isVerticalScrollShowing = function (element) {
        return element.clientHeight < element.scrollHeight;
    };
    Utils.getScrollbarWidth = function () {
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
    };
    Utils.isKeyPressed = function (event, keyToCheck) {
        var pressedKey = event.which || event.keyCode;
        return pressedKey === keyToCheck;
    };
    Utils.setVisible = function (element, visible) {
        this.addOrRemoveCssClass(element, 'ag-hidden', !visible);
    };
    Utils.setHidden = function (element, hidden) {
        this.addOrRemoveCssClass(element, 'ag-visibility-hidden', hidden);
    };
    Utils.isBrowserIE = function () {
        if (this.isIE === undefined) {
            this.isIE = false || !!document.documentMode; // At least IE6
        }
        return this.isIE;
    };
    Utils.isBrowserEdge = function () {
        if (this.isEdge === undefined) {
            this.isEdge = !this.isBrowserIE() && !!window.StyleMedia;
        }
        return this.isEdge;
    };
    Utils.isBrowserSafari = function () {
        if (this.isSafari === undefined) {
            var anyWindow = window;
            // taken from https://github.com/ag-grid/ag-grid/issues/550
            this.isSafari = Object.prototype.toString.call(anyWindow.HTMLElement).indexOf('Constructor') > 0
                || (function (p) {
                    return p.toString() === "[object SafariRemoteNotification]";
                })(!anyWindow.safari || anyWindow.safari.pushNotification);
        }
        return this.isSafari;
    };
    Utils.isBrowserChrome = function () {
        if (this.isChrome === undefined) {
            var anyWindow = window;
            this.isChrome = !!anyWindow.chrome && !!anyWindow.chrome.webstore;
        }
        return this.isChrome;
    };
    Utils.isBrowserFirefox = function () {
        if (this.isFirefox === undefined) {
            var anyWindow = window;
            this.isFirefox = typeof anyWindow.InstallTrigger !== 'undefined';
        }
        return this.isFirefox;
    };
    Utils.isUserAgentIPad = function () {
        if (this.isIPad === undefined) {
            // taken from https://davidwalsh.name/detect-ipad
            this.isIPad = navigator.userAgent.match(/iPad/i) != null;
        }
        return this.isIPad;
    };
    // srcElement is only available in IE. In all other browsers it is target
    // http://stackoverflow.com/questions/5301643/how-can-i-make-event-srcelement-work-in-firefox-and-what-does-it-mean
    Utils.getTarget = function (event) {
        var eventNoType = event;
        return eventNoType.target || eventNoType.srcElement;
    };
    Utils.isElementInEventPath = function (element, event) {
        if (!event || !element) {
            return false;
        }
        var path = exports._.getEventPath(event);
        return path.indexOf(element) >= 0;
    };
    Utils.createEventPath = function (event) {
        var res = [];
        var pointer = exports._.getTarget(event);
        while (pointer) {
            res.push(pointer);
            pointer = pointer.parentElement;
        }
        return res;
    };
    // firefox doesn't have event.path set, or any alternative to it, so we hack
    // it in. this is needed as it's to late to work out the path when the item is
    // removed from the dom. used by MouseEventService, where it works out if a click
    // was from the current grid, or a detail grid (master / detail).
    Utils.addAgGridEventPath = function (event) {
        event.__agGridEventPath = this.getEventPath(event);
    };
    Utils.getEventPath = function (event) {
        // https://stackoverflow.com/questions/39245488/event-path-undefined-with-firefox-and-vue-js
        // https://developer.mozilla.org/en-US/docs/Web/API/Event
        var eventNoType = event;
        if (event.deepPath) {
            // IE supports deep path
            return event.deepPath();
        }
        else if (eventNoType.path) {
            // Chrome supports path
            return eventNoType.path;
        }
        else if (eventNoType.composedPath) {
            // Firefox supports composePath
            return eventNoType.composedPath();
        }
        else if (eventNoType.__agGridEventPath) {
            // Firefox supports composePath
            return eventNoType.__agGridEventPath;
        }
        else {
            // and finally, if none of the above worked,
            // we create the path ourselves
            return this.createEventPath(event);
        }
    };
    Utils.forEachSnapshotFirst = function (list, callback) {
        if (list) {
            var arrayCopy = list.slice(0);
            arrayCopy.forEach(callback);
        }
    };
    // taken from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
    Utils.getBodyWidth = function () {
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
    };
    // taken from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
    Utils.getBodyHeight = function () {
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
    };
    Utils.setCheckboxState = function (eCheckbox, state) {
        if (typeof state === 'boolean') {
            eCheckbox.checked = state;
            eCheckbox.indeterminate = false;
        }
        else {
            // isNodeSelected returns back undefined if it's a group and the children
            // are a mix of selected and unselected
            eCheckbox.indeterminate = true;
        }
    };
    Utils.traverseNodesWithKey = function (nodes, callback) {
        var keyParts = [];
        recursiveSearchNodes(nodes);
        function recursiveSearchNodes(nodes) {
            nodes.forEach(function (node) {
                if (node.group) {
                    keyParts.push(node.key);
                    var key = keyParts.join('|');
                    callback(node, key);
                    recursiveSearchNodes(node.childrenAfterGroup);
                    keyParts.pop();
                }
            });
        }
    };
    // from https://gist.github.com/youssman/745578062609e8acac9f
    Utils.camelCaseToHyphen = function (str) {
        if (str === null || str === undefined) {
            return null;
        }
        return str.replace(/([A-Z])/g, function (g) { return '-' + g[0].toLowerCase(); });
    };
    // from https://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
    Utils.hyphenToCamelCase = function (str) {
        if (str === null || str === undefined) {
            return null;
        }
        return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    };
    // pas in an object eg: {color: 'black', top: '25px'} and it returns "color: black; top: 25px;" for html
    Utils.cssStyleObjectToMarkup = function (stylesToUse) {
        var _this = this;
        if (!stylesToUse) {
            return '';
        }
        var resParts = [];
        this.iterateObject(stylesToUse, function (styleKey, styleValue) {
            var styleKeyDashed = _this.camelCaseToHyphen(styleKey);
            resParts.push(styleKeyDashed + ": " + styleValue + ";");
        });
        return resParts.join(' ');
    };
    /**
     * From http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
     */
    Utils.isNumeric = function (value) {
        if (value === '')
            return false;
        return !isNaN(parseFloat(value)) && isFinite(value);
    };
    Utils.escape = function (toEscape) {
        if (toEscape === null || toEscape === undefined || !toEscape.replace) {
            return toEscape;
        }
        return toEscape.replace(reUnescapedHtml, function (chr) { return HTML_ESCAPES[chr]; });
    };
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
    Utils.normalizeWheel = function (event) {
        var PIXEL_STEP = 10;
        var LINE_HEIGHT = 40;
        var PAGE_HEIGHT = 800;
        // spinX, spinY
        var sX = 0;
        var sY = 0;
        // pixelX, pixelY
        var pX = 0;
        var pY = 0;
        // Legacy
        if ('detail' in event) {
            sY = event.detail;
        }
        if ('wheelDelta' in event) {
            sY = -event.wheelDelta / 120;
        }
        if ('wheelDeltaY' in event) {
            sY = -event.wheelDeltaY / 120;
        }
        if ('wheelDeltaX' in event) {
            sX = -event.wheelDeltaX / 120;
        }
        // side scrolling on FF with DOMMouseScroll
        if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
            sX = sY;
            sY = 0;
        }
        pX = sX * PIXEL_STEP;
        pY = sY * PIXEL_STEP;
        if ('deltaY' in event) {
            pY = event.deltaY;
        }
        if ('deltaX' in event) {
            pX = event.deltaX;
        }
        if ((pX || pY) && event.deltaMode) {
            if (event.deltaMode == 1) {
                pX *= LINE_HEIGHT;
                pY *= LINE_HEIGHT;
            }
            else {
                pX *= PAGE_HEIGHT;
                pY *= PAGE_HEIGHT;
            }
        }
        // Fall-back if spin cannot be determined
        if (pX && !sX) {
            sX = (pX < 1) ? -1 : 1;
        }
        if (pY && !sY) {
            sY = (pY < 1) ? -1 : 1;
        }
        return {
            spinX: sX,
            spinY: sY,
            pixelX: pX,
            pixelY: pY
        };
    };
    /**
     * https://stackoverflow.com/questions/24004791/can-someone-explain-the-debounce-function-in-javascript
     */
    Utils.debounce = function (func, wait, immediate) {
        if (immediate === void 0) { immediate = false; }
        // 'private' variable for instance
        // The returned function will be able to reference this due to closure.
        // Each call to the returned function will share this common timer.
        var timeout;
        // Calling debounce returns a new anonymous function
        return function () {
            // reference the context and args for the setTimeout function
            var context = this, args = arguments;
            // Should the function be called now? If immediate is true
            //   and not already in a timeout then the answer is: Yes
            var callNow = immediate && !timeout;
            // This is the basic debounce behaviour where you can call this
            //   function several times, but it will only execute once
            //   [before or after imposing a delay].
            //   Each time the returned function is called, the timer starts over.
            clearTimeout(timeout);
            // Set the new timeout
            timeout = setTimeout(function () {
                // Inside the timeout function, clear the timeout variable
                // which will let the next execution run when in 'immediate' mode
                timeout = null;
                // Check if the function already ran with the immediate flag
                if (!immediate) {
                    // Call the original function with apply
                    // apply lets you define the 'this' object as well as the arguments
                    //    (both captured before setTimeout)
                    func.apply(context, args);
                }
            }, wait);
            // Immediate mode and no wait timer? Execute the function..
            if (callNow)
                func.apply(context, args);
        };
    };
    ;
    // a user once raised an issue - they said that when you opened a popup (eg context menu)
    // and then clicked on a selection checkbox, the popup wasn't closed. this is because the
    // popup listens for clicks on the body, however ag-grid WAS stopping propagation on the
    // checkbox clicks (so the rows didn't pick them up as row selection selection clicks).
    // to get around this, we have a pattern to stop propagation for the purposes of ag-Grid,
    // but we still let the event pass back to teh body.
    Utils.stopPropagationForAgGrid = function (event) {
        event[AG_GRID_STOP_PROPAGATION] = true;
    };
    Utils.isStopPropagationForAgGrid = function (event) {
        return event[AG_GRID_STOP_PROPAGATION] === true;
    };
    Utils.executeInAWhile = function (funcs) {
        this.executeAfter(funcs, 400);
    };
    Utils.executeNextVMTurn = function (funcs) {
        this.executeAfter(funcs, 0);
    };
    Utils.executeAfter = function (funcs, millis) {
        if (funcs.length > 0) {
            setTimeout(function () {
                funcs.forEach(function (func) { return func(); });
            }, millis);
        }
    };
    Utils.referenceCompare = function (left, right) {
        if (left == null && right == null)
            return true;
        if (left == null && right)
            return false;
        if (left && right == null)
            return false;
        return left === right;
    };
    Utils.get = function (source, expression, defaultValue) {
        if (source == null)
            return defaultValue;
        if (expression.indexOf('.') > -1) {
            var fields = expression.split('.');
            var thisKey = fields[0];
            var nextValue = source[thisKey];
            if (nextValue != null) {
                return Utils.get(nextValue, fields.slice(1, fields.length).join('.'), defaultValue);
            }
            else {
                return defaultValue;
            }
        }
        else {
            var nextValue = source[expression];
            return nextValue != null ? nextValue : defaultValue;
        }
    };
    Utils.addSafePassiveEventListener = function (eElement, event, listener) {
        eElement.addEventListener(event, listener, (Utils.passiveEvents.indexOf(event) > -1 ? { passive: true } : undefined));
    };
    Utils.camelCaseToHumanText = function (camelCase) {
        if (camelCase == null)
            return null;
        // Who needs to learn how to code when you have stack overflow!
        // from: https://stackoverflow.com/questions/15369566/putting-space-in-camel-case-string-using-regular-expression
        var rex = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g;
        var words = camelCase.replace(rex, '$1$4 $2$3$5').replace('.', ' ').split(' ');
        return words.map(function (word) { return word.substring(0, 1).toUpperCase() + ((word.length > 1) ? word.substring(1, word.length) : ''); }).join(' ');
    };
    // displays a message to the browser. this is useful in iPad, where you can't easily see the console.
    // so the javascript code can use this to give feedback. this is NOT intended to be called in production.
    // it is intended the ag-Grid developer calls this to troubleshoot, but then takes out the calls before
    // checking in.
    Utils.message = function (msg) {
        var eMessage = document.createElement('div');
        eMessage.innerHTML = msg;
        var eBox = document.querySelector('#__ag__message');
        if (!eBox) {
            var template = "<div id=\"__ag__message\" style=\"display: inline-block; position: absolute; top: 0px; left: 0px; color: white; background-color: black; z-index: 20; padding: 2px; border: 1px solid darkred; height: 200px; overflow-y: auto;\"></div>";
            eBox = this.loadTemplate(template);
            if (document.body) {
                document.body.appendChild(eBox);
            }
        }
        eBox.appendChild(eMessage);
    };
    // gets called by: a) InMemoryRowNodeManager and b) GroupStage to do sorting.
    // when in InMemoryRowNodeManager we always have indexes (as this sorts the items the
    // user provided) but when in GroupStage, the nodes can contain filler nodes that
    // don't have order id's
    Utils.sortRowNodesByOrder = function (rowNodes, rowNodeOrder) {
        if (!rowNodes) {
            return;
        }
        rowNodes.sort(function (nodeA, nodeB) {
            var positionA = rowNodeOrder[nodeA.id];
            var positionB = rowNodeOrder[nodeB.id];
            var aHasIndex = positionA !== undefined;
            var bHasIndex = positionB !== undefined;
            var bothNodesAreUserNodes = aHasIndex && bHasIndex;
            var bothNodesAreFillerNodes = !aHasIndex && !bHasIndex;
            if (bothNodesAreUserNodes) {
                // when comparing two nodes the user has provided, they always
                // have indexes
                return positionA - positionB;
            }
            else if (bothNodesAreFillerNodes) {
                // when comparing two filler nodes, we have no index to compare them
                // against, however we want this sorting to be deterministic, so that
                // the rows don't jump around as the user does delta updates. so we
                // want the same sort result. so we use the id - which doesn't make sense
                // from a sorting point of view, but does give consistent behaviour between
                // calls. otherwise groups jump around as delta updates are done.
                return nodeA.id > nodeB.id ? 1 : -1;
            }
            else if (aHasIndex) {
                return 1;
            }
            else {
                return -1;
            }
        });
    };
    Utils.PRINTABLE_CHARACTERS = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890!"£$%^&*()_+-=[];\'#,./\\|<>?:@~{}';
    Utils.doOnceFlags = {};
    // static prepend(parent: HTMLElement, child: HTMLElement): void {
    //     if (this.exists(parent.firstChild)) {
    //         parent.insertBefore(child, parent.firstChild);
    //     } else {
    //         parent.appendChild(child);
    //     }
    // }
    Utils.iconNameClassMap = {
        'columnMovePin': 'pin',
        'columnMoveAdd': 'plus',
        'columnMoveHide': 'eye-slash',
        'columnMoveMove': 'arrows',
        'columnMoveLeft': 'left',
        'columnMoveRight': 'right',
        'columnMoveGroup': 'group',
        'columnMoveValue': 'aggregation',
        'columnMovePivot': 'pivot',
        'dropNotAllowed': 'not-allowed',
        'groupContracted': 'expanded',
        'groupExpanded': 'contracted',
        'checkboxChecked': 'checkbox-checked',
        'checkboxUnchecked': 'checkbox-unchecked',
        'checkboxIndeterminate': 'checkbox-indeterminate',
        'checkboxCheckedReadOnly': 'checkbox-checked-readonly',
        'checkboxUncheckedReadOnly': 'checkbox-unchecked-readonly',
        'checkboxIndeterminateReadOnly': 'checkbox-indeterminate-readonly',
        'groupLoading': 'loading',
        'menu': 'menu',
        'filter': 'filter',
        'columns': 'columns',
        'menuPin': 'pin',
        'menuValue': 'aggregation',
        'menuAddRowGroup': 'group',
        'menuRemoveRowGroup': 'group',
        'clipboardCopy': 'copy',
        'clipboardCut': 'cut',
        'clipboardPaste': 'paste',
        'pivotPanel': 'pivot',
        'rowGroupPanel': 'group',
        'valuePanel': 'aggregation',
        'columnGroupOpened': 'expanded',
        'columnGroupClosed': 'contracted',
        'columnSelectClosed': 'tree-closed',
        'columnSelectOpen': 'tree-open',
        // from deprecated header, remove at some point
        'sortAscending': 'asc',
        'sortDescending': 'desc',
        'sortUnSort': 'none'
    };
    Utils.passiveEvents = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
    return Utils;
}());
exports.Utils = Utils;
var NumberSequence = (function () {
    function NumberSequence(initValue, step) {
        if (initValue === void 0) { initValue = 0; }
        if (step === void 0) { step = 1; }
        this.nextValue = initValue;
        this.step = step;
    }
    NumberSequence.prototype.next = function () {
        var valToReturn = this.nextValue;
        this.nextValue += this.step;
        return valToReturn;
    };
    NumberSequence.prototype.peek = function () {
        return this.nextValue;
    };
    NumberSequence.prototype.skip = function (count) {
        this.nextValue += count;
    };
    return NumberSequence;
}());
exports.NumberSequence = NumberSequence;
exports._ = Utils;
var PromiseStatus;
(function (PromiseStatus) {
    PromiseStatus[PromiseStatus["IN_PROGRESS"] = 0] = "IN_PROGRESS";
    PromiseStatus[PromiseStatus["RESOLVED"] = 1] = "RESOLVED";
})(PromiseStatus = exports.PromiseStatus || (exports.PromiseStatus = {}));
var Promise = (function () {
    function Promise(callback) {
        this.status = PromiseStatus.IN_PROGRESS;
        this.resolution = null;
        this.listOfWaiters = [];
        callback(this.onDone.bind(this), this.onReject.bind(this));
    }
    Promise.all = function (toCombine) {
        return new Promise(function (resolve) {
            var combinedValues = [];
            var remainingToResolve = toCombine.length;
            toCombine.forEach(function (source, index) {
                source.then(function (sourceResolved) {
                    remainingToResolve--;
                    combinedValues[index] = sourceResolved;
                    if (remainingToResolve == 0) {
                        resolve(combinedValues);
                    }
                });
                combinedValues.push(null);
            });
        });
    };
    Promise.resolve = function (value) {
        return new Promise(function (resolve) { return resolve(value); });
    };
    Promise.external = function () {
        var capture;
        var promise = new Promise(function (resolve) {
            capture = resolve;
        });
        return {
            promise: promise,
            resolve: function (value) {
                capture(value);
            }
        };
    };
    Promise.prototype.then = function (func) {
        if (this.status === PromiseStatus.IN_PROGRESS) {
            this.listOfWaiters.push(func);
        }
        else {
            func(this.resolution);
        }
    };
    Promise.prototype.firstOneOnly = function (func) {
        if (this.status === PromiseStatus.IN_PROGRESS) {
            if (this.listOfWaiters.length === 0) {
                this.listOfWaiters.push(func);
            }
        }
        else {
            func(this.resolution);
        }
    };
    Promise.prototype.map = function (adapter) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.then(function (unmapped) {
                resolve(adapter(unmapped));
            });
        });
    };
    Promise.prototype.resolveNow = function (ifNotResolvedValue, ifResolved) {
        if (this.status == PromiseStatus.IN_PROGRESS)
            return ifNotResolvedValue;
        return ifResolved(this.resolution);
    };
    Promise.prototype.onDone = function (value) {
        this.status = PromiseStatus.RESOLVED;
        this.resolution = value;
        this.listOfWaiters.forEach(function (waiter) { return waiter(value); });
    };
    Promise.prototype.onReject = function (params) {
        console.warn('TBI');
    };
    return Promise;
}());
exports.Promise = Promise;

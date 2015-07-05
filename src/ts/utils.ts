
module awk.grid {

    var FUNCTION_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var FUNCTION_ARGUMENT_NAMES = /([^\s,]+)/g;

    export class Utils {

        static iterateObject(object: any, callback: any) {
            var keys = Object.keys(object);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = object[key];
                callback(key, value);
            }
        }

        static map(array: any, callback: any) {
            var result: any = [];
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                var mappedItem = callback(item);
                result.push(mappedItem);
            }
            return result;
        }

        static forEach(array: any, callback: any) {
            if (!array) {
                return;
            }

            for (var i = 0; i < array.length; i++) {
                var value = array[i];
                callback(value, i);
            }
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

        static find(collection: any, predicate: any, value: any) {
            if (collection === null || collection === undefined) {
                return null;
            }
            for (var i = 0; i < collection.length; i++) {
                if (collection[i][predicate] === value) {
                    return collection[i];
                }
            }
            return null;
        }

        static toStrings(array: any) {
            return this.map(array, function (item: any) {
                if (item === undefined || item === null || !item.toString) {
                    return null;
                } else {
                    return item.toString();
                }
            });
        }

        static iterateArray(array: any, callback: any) {
            for (var index = 0; index < array.length; index++) {
                var value = array[index];
                callback(value, index);
            }
        }

        static getValue(expressionService: any, data: any, colDef: any, node?: any, api?: any, context?: any) {

            var valueGetter = colDef.valueGetter;
            var field = colDef.field;

            // if there is a value getter, this gets precedence over a field
            if (valueGetter) {

                var params = {
                    data: data,
                    node: node,
                    colDef: colDef,
                    api: api,
                    context: context
                };

                if (typeof valueGetter === 'function') {
                    // valueGetter is a function, so just call it
                    return valueGetter(params);
                } else if (typeof valueGetter === 'string') {
                    // valueGetter is an expression, so execute the expression
                    return expressionService.evaluate(valueGetter, params);
                }

            } else if (field && data) {
                return data[field];
            } else {
                return undefined;
            }
        }

        //Returns true if it is a DOM node
        //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
        static isNode(o: any) {
            return (
                typeof Node === "object" ? o instanceof Node :
                o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
            );
        }

        //Returns true if it is a DOM element
        //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
        static isElement(o: any) {
            return (
                typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
                o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
            );
        }

        static isNodeOrElement(o: any) {
            return this.isNode(o) || this.isElement(o);
        }

        //adds all type of change listeners to an element, intended to be a text field
        static addChangeListener(element: any, listener: any) {
            element.addEventListener("changed", listener);
            element.addEventListener("paste", listener);
            element.addEventListener("input", listener);
        }

        //if value is undefined, null or blank, returns null, otherwise returns the value
        static makeNull(value: any) {
            if (value === null || value === undefined || value === "") {
                return null;
            } else {
                return value;
            }
        }

        static removeAllChildren(node: any) {
            if (node) {
                while (node.hasChildNodes()) {
                    node.removeChild(node.lastChild);
                }
            }
        }

        static isVisible(element: any) {
            return (element.offsetParent !== null)
        }

        //loads the template and returns it as an element. makes up for no simple way in
        //the dom api to load html directly, eg we cannot do this: document.createElement(template)
        static loadTemplate(template: any) {
            var tempDiv = document.createElement("div");
            tempDiv.innerHTML = template;
            return tempDiv.firstChild;
        }

//if passed '42px' then returns the number 42
//        pixelStringToNumber(val: any) {
//            if (typeof val === "string") {
//                if (val.indexOf("px") >= 0) {
//                    val.replace("px", "");
//                }
//                return parseInt(val);
//            } else {
//                return val;
//            }
//        }

        static querySelectorAll_addCssClass(eParent: any, selector: any, cssClass: any) {
            var eRows = eParent.querySelectorAll(selector);
            for (var k = 0; k < eRows.length; k++) {
                this.addCssClass(eRows[k], cssClass);
            }
        }

        static querySelectorAll_removeCssClass(eParent: any, selector: any, cssClass: any) {
            var eRows = eParent.querySelectorAll(selector);
            for (var k = 0; k < eRows.length; k++) {
                this.removeCssClass(eRows[k], cssClass);
            }
        }

        static querySelectorAll_replaceCssClass(eParent: any, selector: any, cssClassToRemove: any, cssClassToAdd: any) {
            var eRows = eParent.querySelectorAll(selector);
            for (var k = 0; k < eRows.length; k++) {
                this.removeCssClass(eRows[k], cssClassToRemove);
                this.addCssClass(eRows[k], cssClassToAdd);
            }
        }

        static addOrRemoveCssClass(element: any, className: any, addOrRemove: any) {
            if (addOrRemove) {
                this.addCssClass(element, className);
            } else {
                this.removeCssClass(element, className);
            }
        }

        static addCssClass(element: any, className: any) {
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

        static offsetHeight(element: any) {
            return element && element.clientHeight ? element.clientHeight : 0;
        }

        static offsetWidth(element: any) {
            return element && element.clientWidth ? element.clientWidth : 0;
        }

        static removeCssClass(element: any, className: any) {
            if (element.className && element.className.length > 0) {
                var cssClasses = element.className.split(' ');
                var index = cssClasses.indexOf(className);
                if (index >= 0) {
                    cssClasses.splice(index, 1);
                    element.className = cssClasses.join(' ');
                }
            }
        }

        static removeFromArray(array: any, object: any) {
            array.splice(array.indexOf(object), 1);
        }

        static defaultComparator(valueA: any, valueB: any) {
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

            if (valueA < valueB) {
                return -1;
            } else if (valueA > valueB) {
                return 1;
            } else {
                return 0;
            }
        }

        static formatWidth(width: any) {
            if (typeof width === "number") {
                return width + "px";
            } else {
                return width;
            }
        }

        // tries to use the provided renderer. if a renderer found, returns true.
        // if no renderer, returns false.
        static useRenderer(eParent: any, eRenderer: any, params: any) {
            var resultFromRenderer = eRenderer(params);
            if (this.isNode(resultFromRenderer) || this.isElement(resultFromRenderer)) {
                //a dom node or element was returned, so add child
                eParent.appendChild(resultFromRenderer);
            } else {
                //otherwise assume it was html, so just insert
                var eTextSpan = document.createElement('span');
                eTextSpan.innerHTML = resultFromRenderer;
                eParent.appendChild(eTextSpan);
            }
        }

        // if icon provided, use this (either a string, or a function callback).
        // if not, then use the second parameter, which is the svgFactory function
        static createIcon(iconName: any, gridOptionsWrapper: any, colDefWrapper: any, svgFactoryFunc: any) {
            var eResult = document.createElement('span');
            var userProvidedIcon: any;
            // check col for icon first
            if (colDefWrapper && colDefWrapper.colDef.icons) {
                userProvidedIcon = colDefWrapper.colDef.icons[iconName];
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
                    eResult.innerHTML = rendererResult;
                } else if (this.isNodeOrElement(rendererResult)) {
                    eResult.appendChild(rendererResult);
                } else {
                    throw 'iconRenderer should return back a string or a dom object';
                }
            } else {
                // otherwise we use the built in icon
                eResult.appendChild(svgFactoryFunc());
            }
            return eResult;
        }

        static addStylesToElement(eElement: any, styles: any) {
            Object.keys(styles).forEach(function (key) {
                eElement.style[key] = styles[key];
            });
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

        static isKeyPressed(event: any, keyToCheck: any) {
            var pressedKey = event.which || event.keyCode;
            return pressedKey === keyToCheck;
        }

        static setVisible(element: any, visible: any) {
            if (visible) {
                element.style.display = 'inline';
            } else {
                element.style.display = 'none';
            }
        }
    }
}


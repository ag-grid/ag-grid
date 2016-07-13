/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var componentUtil_1 = require("./componentUtil");
var grid_1 = require("../grid");
var registered = false;
function initialiseAgGridWithWebComponents() {
    // only register to WebComponents once
    if (registered) {
        return;
    }
    registered = true;
    if (typeof document === 'undefined' || !document.registerElement) {
        console.error('ag-Grid: unable to find document.registerElement() function, unable to initialise ag-Grid as a Web Component');
    }
    // i don't think this type of extension is possible in TypeScript, so back to
    // plain Javascript to create this object
    var AgileGridProto = Object.create(HTMLElement.prototype);
    // wrap each property with a get and set method, so we can track when changes are done
    componentUtil_1.ComponentUtil.ALL_PROPERTIES.forEach(function (key) {
        Object.defineProperty(AgileGridProto, key, {
            set: function (v) {
                this.__agGridSetProperty(key, v);
            },
            get: function () {
                return this.__agGridGetProperty(key);
            }
        });
    });
    AgileGridProto.__agGridSetProperty = function (key, value) {
        if (!this.__attributes) {
            this.__attributes = {};
        }
        this.__attributes[key] = value;
        // keeping this consistent with the ng2 onChange, so I can reuse the handling code
        var changeObject = {};
        changeObject[key] = { currentValue: value };
        this.onChange(changeObject);
    };
    AgileGridProto.onChange = function (changes) {
        if (this._initialised) {
            componentUtil_1.ComponentUtil.processOnChange(changes, this._gridOptions, this.api, this.columnApi);
        }
    };
    AgileGridProto.__agGridGetProperty = function (key) {
        if (!this.__attributes) {
            this.__attributes = {};
        }
        return this.__attributes[key];
    };
    AgileGridProto.setGridOptions = function (options) {
        var globalEventListener = this.globalEventListener.bind(this);
        this._gridOptions = componentUtil_1.ComponentUtil.copyAttributesToGridOptions(options, this);
        this._agGrid = new grid_1.Grid(this, this._gridOptions, globalEventListener);
        this.api = options.api;
        this.columnApi = options.columnApi;
        this._initialised = true;
    };
    // copies all the attributes into this object
    AgileGridProto.createdCallback = function () {
        for (var i = 0; i < this.attributes.length; i++) {
            var attribute = this.attributes[i];
            this.setPropertyFromAttribute(attribute);
        }
    };
    AgileGridProto.setPropertyFromAttribute = function (attribute) {
        var name = toCamelCase(attribute.nodeName);
        var value = attribute.nodeValue;
        if (componentUtil_1.ComponentUtil.ALL_PROPERTIES.indexOf(name) >= 0) {
            this[name] = value;
        }
    };
    AgileGridProto.attachedCallback = function (params) { };
    AgileGridProto.detachedCallback = function (params) { };
    AgileGridProto.attributeChangedCallback = function (attributeName) {
        var attribute = this.attributes[attributeName];
        this.setPropertyFromAttribute(attribute);
    };
    AgileGridProto.globalEventListener = function (eventType, event) {
        var eventLowerCase = eventType.toLowerCase();
        var browserEvent = new Event(eventLowerCase);
        var browserEventNoType = browserEvent;
        browserEventNoType.agGridDetails = event;
        this.dispatchEvent(browserEvent);
        var callbackMethod = 'on' + eventLowerCase;
        if (typeof this[callbackMethod] === 'function') {
            this[callbackMethod](browserEvent);
        }
    };
    // finally, register
    document.registerElement('ag-grid', { prototype: AgileGridProto });
}
exports.initialiseAgGridWithWebComponents = initialiseAgGridWithWebComponents;
function toCamelCase(myString) {
    if (typeof myString === 'string') {
        var result = myString.replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
        return result;
    }
    else {
        return myString;
    }
}

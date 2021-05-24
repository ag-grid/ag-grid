/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { ComponentUtil } from "./componentUtil";
import { Grid } from "../grid";
var registered = false;
export function initialiseAgGridWithWebComponents() {
    console.warn('ag-grid: initialiseAgGridWithWebComponents is deprecated. Please use the ag-grid-webcomponent dependency instead. ');
    // only register to WebComponents once
    if (registered) {
        return;
    }
    registered = true;
    if (typeof document === 'undefined' || !document.registerElement) {
        console.error('AG Grid: unable to find document.registerElement() function, unable to initialise AG Grid as a Web Component');
    }
    // i don't think this type of extension is possible in TypeScript, so back to
    // plain Javascript to create this object
    var AgileGridProto = Object.create(HTMLElement.prototype);
    // wrap each property with a get and set method, so we can track when changes are done
    ComponentUtil.ALL_PROPERTIES.forEach(function (key) {
        Object.defineProperty(AgileGridProto, key, {
            set: function (v) {
                this.__agGridSetProperty(key, v);
            },
            get: function () {
                return this.__agGridGetProperty(key);
            },
            enumerable: true,
            configurable: true
        });
    });
    var agGridProtoNoType = AgileGridProto;
    agGridProtoNoType.__agGridSetProperty = function (key, value) {
        if (!this.__attributes) {
            this.__attributes = {};
        }
        this.__attributes[key] = value;
        // keeping this consistent with the ng2 onChange, so I can reuse the handling code
        var changeObject = {};
        changeObject[key] = { currentValue: value };
        this.onChange(changeObject);
    };
    agGridProtoNoType.onChange = function (changes) {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this._gridOptions, this.api, this.columnApi);
        }
    };
    agGridProtoNoType.__agGridGetProperty = function (key) {
        if (!this.__attributes) {
            this.__attributes = {};
        }
        return this.__attributes[key];
    };
    agGridProtoNoType.setGridOptions = function (options) {
        var globalEventListener = this.globalEventListener.bind(this);
        this._gridOptions = ComponentUtil.copyAttributesToGridOptions(options, this);
        var gridParams = {
            globalEventListener: globalEventListener
        };
        this._agGrid = new Grid(this, this._gridOptions, gridParams);
        this.api = options.api;
        this.columnApi = options.columnApi;
        this._initialised = true;
    };
    // copies all the attributes into this object
    agGridProtoNoType.createdCallback = function () {
        for (var i = 0; i < this.attributes.length; i++) {
            var attribute = this.attributes[i];
            this.setPropertyFromAttribute(attribute);
        }
    };
    agGridProtoNoType.setPropertyFromAttribute = function (attribute) {
        var name = toCamelCase(attribute.nodeName);
        var value = attribute.nodeValue;
        if (ComponentUtil.ALL_PROPERTIES.indexOf(name) >= 0) {
            this[name] = value;
        }
    };
    agGridProtoNoType.attachedCallback = function (params) { };
    agGridProtoNoType.detachedCallback = function (params) { };
    agGridProtoNoType.attributeChangedCallback = function (attributeName) {
        var attribute = this.attributes[attributeName];
        this.setPropertyFromAttribute(attribute);
    };
    agGridProtoNoType.globalEventListener = function (eventType, event) {
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

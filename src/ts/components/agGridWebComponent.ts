import {ComponentUtil} from "./componentUtil";
import {Grid, GridParams} from "../grid";

var registered = false;

export function initialiseAgGridWithWebComponents() {

    // only register to WebComponents once
    if (registered) {
        return;
    }
    registered = true;

    if (typeof document==='undefined' || !(<any>document).registerElement) {
        console.error('ag-Grid: unable to find document.registerElement() function, unable to initialise ag-Grid as a Web Component');
    }

    // i don't think this type of extension is possible in TypeScript, so back to
    // plain Javascript to create this object
    var AgileGridProto = Object.create(HTMLElement.prototype);

    // wrap each property with a get and set method, so we can track when changes are done
    ComponentUtil.ALL_PROPERTIES.forEach((key) => {
       Object.defineProperty(AgileGridProto, key, {
           set: function (v) {
               this.__agGridSetProperty(key, v);
           },
           get: function () {
               return this.__agGridGetProperty(key);
           }
       });
    });

    var agGridProtoNoType = <any> AgileGridProto;

    agGridProtoNoType.__agGridSetProperty = function (key:string, value:any) {
        if (!this.__attributes) {
            this.__attributes = {};
        }
        this.__attributes[key] = value;
        // keeping this consistent with the ng2 onChange, so I can reuse the handling code
        var changeObject = <any>{};
        changeObject[key] = {currentValue: value};
        this.onChange(changeObject);
    };

    agGridProtoNoType.onChange = function (changes:any) {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this._gridOptions, this.api, this.columnApi);
        }
    };

    agGridProtoNoType.__agGridGetProperty = function (key:string) {
        if (!this.__attributes) {
            this.__attributes = {};
        }
        return this.__attributes[key];
    };

    agGridProtoNoType.setGridOptions = function (options: any) {

        var globalEventListener = this.globalEventListener.bind(this);
        this._gridOptions = ComponentUtil.copyAttributesToGridOptions(options, this);
        var gridParams: GridParams = {
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

    agGridProtoNoType.setPropertyFromAttribute = function (attribute: any) {
        var name = toCamelCase(attribute.nodeName);
        var value = attribute.nodeValue;
        if (ComponentUtil.ALL_PROPERTIES.indexOf(name) >= 0) {
            this[name] = value;
        }
    };

    agGridProtoNoType.attachedCallback = function(params: any) {};

    agGridProtoNoType.detachedCallback = function(params: any) {};

    agGridProtoNoType.attributeChangedCallback = function(attributeName: string) {
        var attribute = this.attributes[attributeName];
        this.setPropertyFromAttribute(attribute);
    };

    agGridProtoNoType.globalEventListener = function(eventType: string, event: any): void {
        var eventLowerCase = eventType.toLowerCase();
        var browserEvent = new Event(eventLowerCase);

        var browserEventNoType = <any> browserEvent;
        browserEventNoType.agGridDetails = event;

        this.dispatchEvent(browserEvent);

        var callbackMethod = 'on' + eventLowerCase;
        if (typeof this[callbackMethod] === 'function') {
            this[callbackMethod](browserEvent);
        }
    };

    // finally, register
    (<any>document).registerElement('ag-grid', {prototype: AgileGridProto});
}

function toCamelCase(myString: string): string {
    if (typeof myString === 'string') {
        var result = myString.replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
        return result;
    } else {
        return myString;
    }
}

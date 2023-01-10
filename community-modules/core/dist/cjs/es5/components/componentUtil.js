/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentUtil = void 0;
var events_1 = require("../events");
var propertyKeys_1 = require("../propertyKeys");
var object_1 = require("../utils/object");
var array_1 = require("../utils/array");
var generic_1 = require("../utils/generic");
var ComponentUtil = /** @class */ (function () {
    function ComponentUtil() {
    }
    ComponentUtil.getCallbackForEvent = function (eventName) {
        if (!eventName || eventName.length < 2) {
            return eventName;
        }
        return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
    };
    ComponentUtil.getCoercionLookup = function () {
        var coercionLookup = {};
        __spread(ComponentUtil.ARRAY_PROPERTIES, ComponentUtil.OBJECT_PROPERTIES, ComponentUtil.STRING_PROPERTIES, ComponentUtil.FUNCTION_PROPERTIES, ComponentUtil.EVENT_CALLBACKS).forEach(function (key) { return coercionLookup[key] = 'none'; });
        ComponentUtil.BOOLEAN_PROPERTIES
            .forEach(function (key) { return coercionLookup[key] = 'boolean'; });
        ComponentUtil.NUMBER_PROPERTIES
            .forEach(function (key) { return coercionLookup[key] = 'number'; });
        return coercionLookup;
    };
    ComponentUtil.getValue = function (key, rawValue) {
        var coercionStep = ComponentUtil.coercionLookup[key];
        if (coercionStep) {
            var newValue = rawValue;
            switch (coercionStep) {
                case 'number': {
                    newValue = ComponentUtil.toNumber(rawValue);
                    break;
                }
                case 'boolean': {
                    newValue = ComponentUtil.toBoolean(rawValue);
                    break;
                }
                case 'none': {
                    // if groupAggFiltering exists and isn't a function, handle as a boolean.
                    if (key === 'groupAggFiltering' && typeof rawValue !== 'function') {
                        newValue = ComponentUtil.toBoolean(rawValue);
                    }
                    break;
                }
            }
            return newValue;
        }
        return undefined;
    };
    ComponentUtil.getGridOptionKeys = function (component, isVue) {
        // Vue does not have keys in prod so instead need to run through all the 
        // gridOptions checking for presence of a gridOption key.
        return isVue
            ? Object.keys(ComponentUtil.coercionLookup)
            : Object.keys(component);
    };
    ComponentUtil.copyAttributesToGridOptions = function (gridOptions, component, isVue) {
        if (isVue === void 0) { isVue = false; }
        // create empty grid options if none were passed
        if (typeof gridOptions !== 'object') {
            gridOptions = {};
        }
        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        var pGridOptions = gridOptions;
        var keys = ComponentUtil.getGridOptionKeys(component, isVue);
        // Loop through component props, if they are not undefined and a valid gridOption copy to gridOptions
        keys.forEach(function (key) {
            var value = component[key];
            if (typeof value !== 'undefined') {
                var coercedValue = ComponentUtil.getValue(key, value);
                if (coercedValue !== undefined) {
                    pGridOptions[key] = coercedValue;
                }
            }
        });
        return gridOptions;
    };
    ComponentUtil.processOnChange = function (changes, api) {
        if (!changes || Object.keys(changes).length === 0) {
            return;
        }
        var changesToApply = __assign({}, changes);
        // We manually call these updates so that we can provide a different source of gridOptionsChanged
        // We do not call setProperty as this will be called by the grid api methods
        if (changesToApply.autoGroupColumnDef) {
            api.setAutoGroupColumnDef(changesToApply.autoGroupColumnDef.currentValue, "gridOptionsChanged");
            delete changesToApply.autoGroupColumnDef;
        }
        if (changesToApply.defaultColDef) {
            api.setDefaultColDef(changesToApply.defaultColDef.currentValue, "gridOptionsChanged");
            delete changesToApply.defaultColDef;
        }
        if (changesToApply.columnDefs) {
            api.setColumnDefs(changesToApply.columnDefs.currentValue, "gridOptionsChanged");
            delete changesToApply.columnDefs;
        }
        Object.keys(changesToApply).forEach(function (key) {
            var gridKey = key;
            var coercedValue = ComponentUtil.getValue(gridKey, changesToApply[gridKey].currentValue);
            api.__setProperty(gridKey, coercedValue);
        });
        // copy changes into an event for dispatch
        var event = {
            type: events_1.Events.EVENT_COMPONENT_STATE_CHANGED
        };
        object_1.iterateObject(changes, function (key, value) {
            event[key] = value;
        });
        api.dispatchEvent(event);
    };
    ComponentUtil.toBoolean = function (value) {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            // for boolean, compare to empty String to allow attributes appearing with
            // no value to be treated as 'true'
            return value.toUpperCase() === 'TRUE' || value == '';
        }
        return false;
    };
    ComponentUtil.toNumber = function (value) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            return Number(value);
        }
    };
    // all events
    ComponentUtil.EVENTS = generic_1.values(events_1.Events);
    // events that are internal to AG Grid and should not be exposed to users via documentation or generated framework components
    /** Exclude the following internal events from code generation to prevent exposing these events via framework components */
    ComponentUtil.EXCLUDED_INTERNAL_EVENTS = [
        events_1.Events.EVENT_SCROLLBAR_WIDTH_CHANGED,
        events_1.Events.EVENT_CHECKBOX_CHANGED,
        events_1.Events.EVENT_HEIGHT_SCALE_CHANGED,
        events_1.Events.EVENT_BODY_HEIGHT_CHANGED,
        events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
        events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED,
        events_1.Events.EVENT_COLUMN_HOVER_CHANGED,
        events_1.Events.EVENT_FLASH_CELLS,
        events_1.Events.EVENT_PAGINATION_PIXEL_OFFSET_CHANGED,
        events_1.Events.EVENT_DISPLAYED_ROWS_CHANGED,
        events_1.Events.EVENT_LEFT_PINNED_WIDTH_CHANGED,
        events_1.Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED,
        events_1.Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED,
        events_1.Events.EVENT_POPUP_TO_FRONT,
        events_1.Events.EVENT_KEYBOARD_FOCUS,
        events_1.Events.EVENT_MOUSE_FOCUS,
        events_1.Events.EVENT_STORE_UPDATED,
        events_1.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
        events_1.Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END,
        events_1.Events.EVENT_FILL_START,
        events_1.Events.EVENT_FILL_END,
        events_1.Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START,
        events_1.Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END,
        events_1.Events.EVENT_FULL_WIDTH_ROW_FOCUSED,
        events_1.Events.EVENT_HEADER_HEIGHT_CHANGED,
        events_1.Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED
    ];
    // events that are available for use by users of AG Grid and so should be documented
    /** EVENTS that should be exposed via code generation for the framework components.  */
    ComponentUtil.PUBLIC_EVENTS = ComponentUtil.EVENTS.filter(function (e) { return !array_1.includes(ComponentUtil.EXCLUDED_INTERNAL_EVENTS, e); });
    // onXXX methods, based on the above events
    ComponentUtil.EVENT_CALLBACKS = ComponentUtil.EVENTS.map(function (event) { return ComponentUtil.getCallbackForEvent(event); });
    ComponentUtil.STRING_PROPERTIES = propertyKeys_1.PropertyKeys.STRING_PROPERTIES;
    ComponentUtil.OBJECT_PROPERTIES = propertyKeys_1.PropertyKeys.OBJECT_PROPERTIES;
    ComponentUtil.ARRAY_PROPERTIES = propertyKeys_1.PropertyKeys.ARRAY_PROPERTIES;
    ComponentUtil.NUMBER_PROPERTIES = propertyKeys_1.PropertyKeys.NUMBER_PROPERTIES;
    ComponentUtil.BOOLEAN_PROPERTIES = propertyKeys_1.PropertyKeys.BOOLEAN_PROPERTIES;
    ComponentUtil.FUNCTION_PROPERTIES = propertyKeys_1.PropertyKeys.FUNCTION_PROPERTIES;
    ComponentUtil.ALL_PROPERTIES = propertyKeys_1.PropertyKeys.ALL_PROPERTIES;
    ComponentUtil.ALL_PROPERTIES_SET = new Set(propertyKeys_1.PropertyKeys.ALL_PROPERTIES);
    ComponentUtil.coercionLookup = ComponentUtil.getCoercionLookup();
    return ComponentUtil;
}());
exports.ComponentUtil = ComponentUtil;

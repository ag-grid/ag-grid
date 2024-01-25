// ag-grid-react v31.0.3
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextValueIfDifferent = exports.agFlushSync = exports.isComponentStateless = exports.CssClasses = exports.classesList = void 0;
var react_dom_1 = __importDefault(require("react-dom"));
var classesList = function () {
    var list = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        list[_i] = arguments[_i];
    }
    var filtered = list.filter(function (s) { return s != null && s !== ''; });
    return filtered.join(' ');
};
exports.classesList = classesList;
var CssClasses = /** @class */ (function () {
    function CssClasses() {
        var _this = this;
        var initialClasses = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            initialClasses[_i] = arguments[_i];
        }
        this.classesMap = {};
        initialClasses.forEach(function (className) {
            _this.classesMap[className] = true;
        });
    }
    CssClasses.prototype.setClass = function (className, on) {
        // important to not make a copy if nothing has changed, so react
        // won't trigger a render cycle on new object instance
        var nothingHasChanged = !!this.classesMap[className] == on;
        if (nothingHasChanged) {
            return this;
        }
        var res = new CssClasses();
        res.classesMap = __assign({}, this.classesMap);
        res.classesMap[className] = on;
        return res;
    };
    CssClasses.prototype.toString = function () {
        var _this = this;
        var res = Object.keys(this.classesMap).filter(function (key) { return _this.classesMap[key]; }).join(' ');
        return res;
    };
    return CssClasses;
}());
exports.CssClasses = CssClasses;
var isComponentStateless = function (Component) {
    var hasSymbol = function () { return typeof Symbol === 'function' && Symbol.for; };
    var getMemoType = function () { return hasSymbol() ? Symbol.for('react.memo') : 0xead3; };
    return (typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent)) || (typeof Component === 'object' && Component.$$typeof === getMemoType());
};
exports.isComponentStateless = isComponentStateless;
// CreateRoot is only available from React 18, which if used requires us to use flushSync.
var createRootAndFlushSyncAvailable = react_dom_1.default.createRoot != null && react_dom_1.default.flushSync != null;
/**
 * Wrapper around flushSync to provide backwards compatibility with React 16-17
 * Also allows us to control via the `useFlushSync` param whether we want to use flushSync or not
 * as we do not want to use flushSync when we are likely to already be in a render cycle
 */
var agFlushSync = function (useFlushSync, fn) {
    if (createRootAndFlushSyncAvailable && useFlushSync) {
        react_dom_1.default.flushSync(fn);
    }
    else {
        fn();
    }
};
exports.agFlushSync = agFlushSync;
/**
 * The aim of this function is to maintain references to prev or next values where possible.
 * If there are not real changes then return the prev value to avoid unnecessary renders.
 * @param maintainOrder If we want to maintain the order of the elements in the dom in line with the next array
 * @returns
 */
function getNextValueIfDifferent(prev, next, maintainOrder) {
    if (next == null || prev == null) {
        return next;
    }
    // If same array instance nothing to do.
    // If both empty arrays maintain reference of prev.
    if (prev === next || (next.length === 0 && prev.length === 0)) {
        return prev;
    }
    // If maintaining dom order just return next
    // If prev is empty just return next immediately as no previous order to maintain
    // If prev was not empty but next is empty return next immediately
    if (maintainOrder || (prev.length === 0 && next.length > 0) || (prev.length > 0 && next.length === 0)) {
        return next;
    }
    // if dom order not important, we don't want to change the order
    // of the elements in the dom, as this would break transition styles
    var oldValues = [];
    var newValues = [];
    var prevMap = new Map();
    var nextMap = new Map();
    for (var i = 0; i < next.length; i++) {
        var c = next[i];
        nextMap.set(c.getInstanceId(), c);
    }
    for (var i = 0; i < prev.length; i++) {
        var c = prev[i];
        prevMap.set(c.getInstanceId(), c);
        if (nextMap.has(c.getInstanceId())) {
            oldValues.push(c);
        }
    }
    for (var i = 0; i < next.length; i++) {
        var c = next[i];
        var instanceId = c.getInstanceId();
        if (!prevMap.has(instanceId)) {
            newValues.push(c);
        }
    }
    // All the same values exist just maybe in a different order so maintain the existing reference
    if (oldValues.length === prev.length && newValues.length === 0) {
        return prev;
    }
    // All new values so avoid spreading the new array to maintain the reference
    if (oldValues.length === 0 && newValues.length === next.length) {
        return next;
    }
    // Spread as we need to combine the old and new values
    return __spreadArray(__spreadArray([], oldValues), newValues);
}
exports.getNextValueIfDifferent = getNextValueIfDifferent;

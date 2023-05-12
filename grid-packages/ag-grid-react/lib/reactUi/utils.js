// ag-grid-react v29.3.5
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agFlushSync = exports.isComponentStateless = exports.CssClasses = exports.classesList = void 0;
var react_dom_1 = __importDefault(require("react-dom"));
exports.classesList = function () {
    var list = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        list[_i] = arguments[_i];
    }
    var filtered = list.filter(function (s) { return s != null && s !== ''; });
    return filtered.join(' ');
};
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
exports.isComponentStateless = function (Component) {
    var hasSymbol = function () { return typeof Symbol === 'function' && Symbol.for; };
    var getMemoType = function () { return hasSymbol() ? Symbol.for('react.memo') : 0xead3; };
    return (typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent)) || (typeof Component === 'object' && Component.$$typeof === getMemoType());
};
// CreateRoot is only available from React 18, which if used requires us to use flushSync.
var createRootAndFlushSyncAvailable = react_dom_1.default.createRoot != null && react_dom_1.default.flushSync != null;
/**
 * Wrapper around flushSync to provide backwards compatibility with React 16-17
 * Also allows us to control via the `useFlushSync` param whether we want to use flushSync or not
 * as we do not want to use flushSync when we are likely to already be in a render cycle
 */
exports.agFlushSync = function (useFlushSync, fn) {
    if (createRootAndFlushSyncAvailable && useFlushSync) {
        react_dom_1.default.flushSync(fn);
    }
    else {
        fn();
    }
};

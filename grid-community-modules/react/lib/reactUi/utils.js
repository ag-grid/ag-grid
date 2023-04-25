// @ag-grid-community/react v29.3.3
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agFlushSync = exports.FlushSyncToggle = exports.isComponentStateless = exports.CssClasses = exports.classesList = void 0;
const react_dom_1 = __importDefault(require("react-dom"));
exports.classesList = (...list) => {
    const filtered = list.filter(s => s != null && s !== '');
    return filtered.join(' ');
};
class CssClasses {
    constructor(...initialClasses) {
        this.classesMap = {};
        initialClasses.forEach(className => {
            this.classesMap[className] = true;
        });
    }
    setClass(className, on) {
        // important to not make a copy if nothing has changed, so react
        // won't trigger a render cycle on new object instance
        const nothingHasChanged = !!this.classesMap[className] == on;
        if (nothingHasChanged) {
            return this;
        }
        const res = new CssClasses();
        res.classesMap = Object.assign({}, this.classesMap);
        res.classesMap[className] = on;
        return res;
    }
    toString() {
        const res = Object.keys(this.classesMap).filter(key => this.classesMap[key]).join(' ');
        return res;
    }
}
exports.CssClasses = CssClasses;
exports.isComponentStateless = (Component) => {
    const hasSymbol = () => typeof Symbol === 'function' && Symbol.for;
    const getMemoType = () => hasSymbol() ? Symbol.for('react.memo') : 0xead3;
    return (typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent)) || (typeof Component === 'object' && Component.$$typeof === getMemoType());
};
// CreateRoot is only available from React 18, which if used requires us to use flushSync.
const createRootAndFlushSyncAvailable = react_dom_1.default.createRoot != null && react_dom_1.default.flushSync != null;
var agFlushSyncActive = true;
exports.FlushSyncToggle = {
    on: () => agFlushSyncActive = true,
    off: () => agFlushSyncActive = false
};
// Avoid using nested flushSync calls, as this causes error messages in the console.
let activeFlushSyncs = 0;
/**
 * Wrapper around flushSync to provide backwards compatibility with React 16-17
 * @param fn
 */
exports.agFlushSync = (fn) => {
    if (createRootAndFlushSyncAvailable && agFlushSyncActive && activeFlushSyncs === 0) {
        activeFlushSyncs++;
        react_dom_1.default.flushSync(fn);
        activeFlushSyncs--;
    }
    else {
        fn();
    }
};

//# sourceMappingURL=utils.js.map

// @ag-grid-community/react v28.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

//# sourceMappingURL=utils.js.map

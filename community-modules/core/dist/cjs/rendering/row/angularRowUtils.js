/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
Object.defineProperty(exports, "__esModule", { value: true });
var AngularRowUtils = /** @class */ (function () {
    function AngularRowUtils() {
    }
    AngularRowUtils.createChildScopeOrNull = function (rowNode, parentScope, gridOptionsWrapper) {
        var isAngularCompileRows = gridOptionsWrapper.isAngularCompileRows();
        if (!isAngularCompileRows) {
            return null;
        }
        var newChildScope = parentScope.$new();
        newChildScope.data = __assign({}, rowNode.data);
        newChildScope.rowNode = rowNode;
        newChildScope.context = gridOptionsWrapper.getContext();
        var destroyFunc = function () {
            newChildScope.$destroy();
            newChildScope.data = null;
            newChildScope.rowNode = null;
            newChildScope.context = null;
        };
        return {
            scope: newChildScope,
            scopeDestroyFunc: destroyFunc
        };
    };
    return AngularRowUtils;
}());
exports.AngularRowUtils = AngularRowUtils;

//# sourceMappingURL=angularRowUtils.js.map

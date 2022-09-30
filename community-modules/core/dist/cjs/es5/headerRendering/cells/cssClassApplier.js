/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var generic_1 = require("../../utils/generic");
var CssClassApplier = /** @class */ (function () {
    function CssClassApplier() {
    }
    CssClassApplier.getHeaderClassesFromColDef = function (abstractColDef, gridOptionsWrapper, column, columnGroup) {
        if (generic_1.missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, gridOptionsWrapper, column, columnGroup);
    };
    CssClassApplier.getToolPanelClassesFromColDef = function (abstractColDef, gridOptionsWrapper, column, columnGroup) {
        if (generic_1.missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.toolPanelClass, abstractColDef, gridOptionsWrapper, column, columnGroup);
    };
    CssClassApplier.getClassParams = function (abstractColDef, gridOptionsWrapper, column, columnGroup) {
        return {
            // bad naming, as colDef here can be a group or a column,
            // however most people won't appreciate the difference,
            // so keeping it as colDef to avoid confusion.
            colDef: abstractColDef,
            column: column,
            columnGroup: columnGroup,
            api: gridOptionsWrapper.getApi(),
            columnApi: gridOptionsWrapper.getColumnApi(),
            context: gridOptionsWrapper.getContext()
        };
    };
    CssClassApplier.getColumnClassesFromCollDef = function (classesOrFunc, abstractColDef, gridOptionsWrapper, column, columnGroup) {
        if (generic_1.missing(classesOrFunc)) {
            return [];
        }
        var classToUse;
        if (typeof classesOrFunc === 'function') {
            var params = this.getClassParams(abstractColDef, gridOptionsWrapper, column, columnGroup);
            classToUse = classesOrFunc(params);
        }
        else {
            classToUse = classesOrFunc;
        }
        if (typeof classToUse === 'string') {
            return [classToUse];
        }
        if (Array.isArray(classToUse)) {
            return __spread(classToUse);
        }
        return [];
    };
    return CssClassApplier;
}());
exports.CssClassApplier = CssClassApplier;

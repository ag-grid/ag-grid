/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
exports.CssClassApplier = void 0;
var generic_1 = require("../../utils/generic");
var CssClassApplier = /** @class */ (function () {
    function CssClassApplier() {
    }
    CssClassApplier.getHeaderClassesFromColDef = function (abstractColDef, gridOptionsService, column, columnGroup) {
        if (generic_1.missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, gridOptionsService, column, columnGroup);
    };
    CssClassApplier.getToolPanelClassesFromColDef = function (abstractColDef, gridOptionsService, column, columnGroup) {
        if (generic_1.missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.toolPanelClass, abstractColDef, gridOptionsService, column, columnGroup);
    };
    CssClassApplier.getClassParams = function (abstractColDef, gridOptionsService, column, columnGroup) {
        return {
            // bad naming, as colDef here can be a group or a column,
            // however most people won't appreciate the difference,
            // so keeping it as colDef to avoid confusion.
            colDef: abstractColDef,
            column: column,
            columnGroup: columnGroup,
            api: gridOptionsService.get('api'),
            columnApi: gridOptionsService.get('columnApi'),
            context: gridOptionsService.get('context')
        };
    };
    CssClassApplier.getColumnClassesFromCollDef = function (classesOrFunc, abstractColDef, gridOptionsService, column, columnGroup) {
        if (generic_1.missing(classesOrFunc)) {
            return [];
        }
        var classToUse;
        if (typeof classesOrFunc === 'function') {
            var params = this.getClassParams(abstractColDef, gridOptionsService, column, columnGroup);
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

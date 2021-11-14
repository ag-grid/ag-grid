/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
    CssClassApplier.getColumnClassesFromCollDef = function (classesOrFunc, abstractColDef, gridOptionsWrapper, column, columnGroup) {
        if (generic_1.missing(classesOrFunc)) {
            return [];
        }
        var classToUse;
        if (typeof classesOrFunc === 'function') {
            var params = {
                // bad naming, as colDef here can be a group or a column,
                // however most people won't appreciate the difference,
                // so keeping it as colDef to avoid confusion.
                colDef: abstractColDef,
                column: column,
                columnGroup: columnGroup,
                context: gridOptionsWrapper.getContext(),
                api: gridOptionsWrapper.getApi()
            };
            classToUse = classesOrFunc(params);
        }
        else {
            classToUse = classesOrFunc;
        }
        if (typeof classToUse === 'string') {
            return [classToUse];
        }
        else if (Array.isArray(classToUse)) {
            return classToUse;
        }
        else {
            return [];
        }
    };
    return CssClassApplier;
}());
exports.CssClassApplier = CssClassApplier;

//# sourceMappingURL=cssClassApplier.js.map

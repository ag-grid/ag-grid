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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { missing } from "../../utils/generic";
var CSS_FIRST_COLUMN = 'ag-column-first';
var CSS_LAST_COLUMN = 'ag-column-last';
var CssClassApplier = /** @class */ (function () {
    function CssClassApplier() {
    }
    CssClassApplier.getHeaderClassesFromColDef = function (abstractColDef, gridOptionsService, column, columnGroup) {
        if (missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, gridOptionsService, column, columnGroup);
    };
    CssClassApplier.getToolPanelClassesFromColDef = function (abstractColDef, gridOptionsService, column, columnGroup) {
        if (missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.toolPanelClass, abstractColDef, gridOptionsService, column, columnGroup);
    };
    CssClassApplier.refreshFirstAndLastStyles = function (comp, column, columnModel) {
        comp.addOrRemoveCssClass(CSS_FIRST_COLUMN, columnModel.isColumnAtEdge(column, 'first'));
        comp.addOrRemoveCssClass(CSS_LAST_COLUMN, columnModel.isColumnAtEdge(column, 'last'));
    };
    CssClassApplier.getClassParams = function (abstractColDef, gridOptionsService, column, columnGroup) {
        return {
            // bad naming, as colDef here can be a group or a column,
            // however most people won't appreciate the difference,
            // so keeping it as colDef to avoid confusion.
            colDef: abstractColDef,
            column: column,
            columnGroup: columnGroup,
            api: gridOptionsService.api,
            columnApi: gridOptionsService.columnApi,
            context: gridOptionsService.context
        };
    };
    CssClassApplier.getColumnClassesFromCollDef = function (classesOrFunc, abstractColDef, gridOptionsService, column, columnGroup) {
        if (missing(classesOrFunc)) {
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
            return __spreadArray([], __read(classToUse), false);
        }
        return [];
    };
    return CssClassApplier;
}());
export { CssClassApplier };

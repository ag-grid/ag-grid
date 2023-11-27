"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssClassApplier = void 0;
const generic_1 = require("../../utils/generic");
const CSS_FIRST_COLUMN = 'ag-column-first';
const CSS_LAST_COLUMN = 'ag-column-last';
class CssClassApplier {
    static getHeaderClassesFromColDef(abstractColDef, gridOptionsService, column, columnGroup) {
        if ((0, generic_1.missing)(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, gridOptionsService, column, columnGroup);
    }
    static getToolPanelClassesFromColDef(abstractColDef, gridOptionsService, column, columnGroup) {
        if ((0, generic_1.missing)(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.toolPanelClass, abstractColDef, gridOptionsService, column, columnGroup);
    }
    static refreshFirstAndLastStyles(comp, column, columnModel) {
        comp.addOrRemoveCssClass(CSS_FIRST_COLUMN, columnModel.isColumnAtEdge(column, 'first'));
        comp.addOrRemoveCssClass(CSS_LAST_COLUMN, columnModel.isColumnAtEdge(column, 'last'));
    }
    static getClassParams(abstractColDef, gridOptionsService, column, columnGroup) {
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
    }
    static getColumnClassesFromCollDef(classesOrFunc, abstractColDef, gridOptionsService, column, columnGroup) {
        if ((0, generic_1.missing)(classesOrFunc)) {
            return [];
        }
        let classToUse;
        if (typeof classesOrFunc === 'function') {
            const params = this.getClassParams(abstractColDef, gridOptionsService, column, columnGroup);
            classToUse = classesOrFunc(params);
        }
        else {
            classToUse = classesOrFunc;
        }
        if (typeof classToUse === 'string') {
            return [classToUse];
        }
        if (Array.isArray(classToUse)) {
            return [...classToUse];
        }
        return [];
    }
}
exports.CssClassApplier = CssClassApplier;

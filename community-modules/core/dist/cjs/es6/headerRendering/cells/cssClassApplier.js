/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssClassApplier = void 0;
const generic_1 = require("../../utils/generic");
class CssClassApplier {
    static getHeaderClassesFromColDef(abstractColDef, gridOptionsService, column, columnGroup) {
        if (generic_1.missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, gridOptionsService, column, columnGroup);
    }
    static getToolPanelClassesFromColDef(abstractColDef, gridOptionsService, column, columnGroup) {
        if (generic_1.missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.toolPanelClass, abstractColDef, gridOptionsService, column, columnGroup);
    }
    static getClassParams(abstractColDef, gridOptionsService, column, columnGroup) {
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
    }
    static getColumnClassesFromCollDef(classesOrFunc, abstractColDef, gridOptionsService, column, columnGroup) {
        if (generic_1.missing(classesOrFunc)) {
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

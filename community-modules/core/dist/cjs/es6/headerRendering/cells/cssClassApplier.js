/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generic_1 = require("../../utils/generic");
class CssClassApplier {
    static getHeaderClassesFromColDef(abstractColDef, gridOptionsWrapper, column, columnGroup) {
        if (generic_1.missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, gridOptionsWrapper, column, columnGroup);
    }
    static getToolPanelClassesFromColDef(abstractColDef, gridOptionsWrapper, column, columnGroup) {
        if (generic_1.missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.toolPanelClass, abstractColDef, gridOptionsWrapper, column, columnGroup);
    }
    static getClassParams(abstractColDef, gridOptionsWrapper, column, columnGroup) {
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
    }
    static getColumnClassesFromCollDef(classesOrFunc, abstractColDef, gridOptionsWrapper, column, columnGroup) {
        if (generic_1.missing(classesOrFunc)) {
            return [];
        }
        let classToUse;
        if (typeof classesOrFunc === 'function') {
            const params = this.getClassParams(abstractColDef, gridOptionsWrapper, column, columnGroup);
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

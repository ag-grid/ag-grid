/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { missing } from "../../utils/generic";
export class CssClassApplier {
    static getHeaderClassesFromColDef(abstractColDef, gridOptionsWrapper, column, columnGroup) {
        if (missing(abstractColDef)) {
            return [];
        }
        return this.getColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, gridOptionsWrapper, column, columnGroup);
    }
    static getToolPanelClassesFromColDef(abstractColDef, gridOptionsWrapper, column, columnGroup) {
        if (missing(abstractColDef)) {
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
        if (missing(classesOrFunc)) {
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

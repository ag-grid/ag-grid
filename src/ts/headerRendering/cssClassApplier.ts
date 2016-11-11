import {AbstractColDef} from "../entities/colDef";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Utils as _} from '../utils';
import {ColumnGroup} from "../entities/columnGroup";
import {Column} from "../entities/column";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";

export class CssClassApplier {

    public static addHeaderClassesFromColDef(abstractColDef: AbstractColDef, eHeaderCell: HTMLElement, gridOptionsWrapper: GridOptionsWrapper, column: Column, columnGroup: ColumnGroup) {
        if (_.missing(abstractColDef)) { return; }
        this.addColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, eHeaderCell, gridOptionsWrapper, column, columnGroup);
    }

    public static addToolPanelClassesFromColDef(abstractColDef: AbstractColDef, eHeaderCell: HTMLElement, gridOptionsWrapper: GridOptionsWrapper, column: Column, columnGroup: OriginalColumnGroup) {
        if (_.missing(abstractColDef)) { return; }
        this.addColumnClassesFromCollDef(abstractColDef.toolPanelClass, abstractColDef, eHeaderCell, gridOptionsWrapper, column, columnGroup);
    }

    public static addColumnClassesFromCollDef(
                            classesOrFunc: string | string[] | ((params: any) => string | string[]),
                            abstractColDef: AbstractColDef,
                            eHeaderCell: HTMLElement,
                            gridOptionsWrapper: GridOptionsWrapper,
                            column: Column,
                            columnGroup: ColumnGroup|OriginalColumnGroup) {
        if (_.missing(classesOrFunc)) { return; }
        var classToUse: string | string[];
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
            var headerClassFunc = <(params: any) => string | string[]> classesOrFunc;
            classToUse = headerClassFunc(params);
        } else {
            classToUse = <string | string[]> classesOrFunc;
        }

        if (typeof classToUse === 'string') {
            _.addCssClass(eHeaderCell, classToUse);
        } else if (Array.isArray(classToUse)) {
            classToUse.forEach((cssClassItem: any): void => {
                _.addCssClass(eHeaderCell, cssClassItem);
            });
        }
    }
}
import {AbstractColDef} from "../entities/colDef";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Utils as _} from '../utils';
import {ColumnGroup} from "../entities/columnGroup";
import {Column} from "../entities/column";

export class CssClassApplier {

    public static addHeaderClassesFromCollDef(abstractColDef: AbstractColDef, eHeaderCell: HTMLElement, gridOptionsWrapper: GridOptionsWrapper, column: Column, columnGroup: ColumnGroup) {
        if (abstractColDef && abstractColDef.headerClass) {
            var classToUse: string | string[];
            if (typeof abstractColDef.headerClass === 'function') {
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
                var headerClassFunc = <(params: any) => string | string[]> abstractColDef.headerClass;
                classToUse = headerClassFunc(params);
            } else {
                classToUse = <string | string[]> abstractColDef.headerClass;
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
}
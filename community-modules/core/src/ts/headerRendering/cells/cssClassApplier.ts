import { AbstractColDef, HeaderClassParams, ToolPanelClassParams } from "../../entities/colDef";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ProvidedColumnGroup } from "../../entities/providedColumnGroup";
import { missing } from "../../utils/generic";

export class CssClassApplier {

    public static getHeaderClassesFromColDef(
        abstractColDef: AbstractColDef | null,
        gridOptionsWrapper: GridOptionsWrapper,
        column: Column | null,
        columnGroup: ColumnGroup | null
    ): string[] {
        if (missing(abstractColDef)) { return []; }

        return this.getColumnClassesFromCollDef(
            abstractColDef.headerClass,
            abstractColDef,
            gridOptionsWrapper,
            column,
            columnGroup
        );
    }

    public static getToolPanelClassesFromColDef(
        abstractColDef: AbstractColDef | null,
        gridOptionsWrapper: GridOptionsWrapper,
        column: Column | null,
        columnGroup: ProvidedColumnGroup | null
    ): string[] {
        if (missing(abstractColDef)) { return []; }

        return this.getColumnClassesFromCollDef(
            abstractColDef.toolPanelClass,
            abstractColDef,
            gridOptionsWrapper,
            column,
            columnGroup
        );
    }

    private static getColumnClassesFromCollDef(
        classesOrFunc: string | string[] | ((params: HeaderClassParams | ToolPanelClassParams) => string | string[]) | null | undefined,
        abstractColDef: AbstractColDef,
        gridOptionsWrapper: GridOptionsWrapper,
        column: Column | null,
        columnGroup: ColumnGroup | ProvidedColumnGroup | null
    ): string[] {
        if (missing(classesOrFunc)) { return []; }

        let classToUse: string | string[];

        if (typeof classesOrFunc === 'function') {
            const params: HeaderClassParams = {
                // bad naming, as colDef here can be a group or a column,
                // however most people won't appreciate the difference,
                // so keeping it as colDef to avoid confusion.
                colDef: abstractColDef,
                column: column,
                columnGroup: columnGroup,
                context: gridOptionsWrapper.getContext(),
                api: gridOptionsWrapper.getApi()!
            };
            classToUse = classesOrFunc(params);
        } else {
            classToUse = classesOrFunc;
        }

        if (typeof classToUse === 'string') { return [classToUse]; }
        if (Array.isArray(classToUse)) { return classToUse; }

        return [];
    }
}
import { AbstractColDef, HeaderClassParams, ToolPanelClassParams } from "../../entities/colDef";
import { GridOptionsService } from "../../gridOptionsService";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ProvidedColumnGroup } from "../../entities/providedColumnGroup";
import { missing } from "../../utils/generic";

export class CssClassApplier {

    public static getHeaderClassesFromColDef(
        abstractColDef: AbstractColDef | null,
        gridOptionsService: GridOptionsService,
        column: Column | null,
        columnGroup: ColumnGroup | null
    ): string[] {
        if (missing(abstractColDef)) { return []; }

        return this.getColumnClassesFromCollDef(
            abstractColDef.headerClass,
            abstractColDef,
            gridOptionsService,
            column,
            columnGroup
        );
    }

    public static getToolPanelClassesFromColDef(
        abstractColDef: AbstractColDef | null,
        gridOptionsService: GridOptionsService,
        column: Column | null,
        columnGroup: ProvidedColumnGroup | null
    ): string[] {
        if (missing(abstractColDef)) { return []; }

        return this.getColumnClassesFromCollDef(
            abstractColDef.toolPanelClass,
            abstractColDef,
            gridOptionsService,
            column,
            columnGroup
        );
    }

    private static getClassParams<T extends HeaderClassParams | ToolPanelClassParams>(abstractColDef: AbstractColDef,
        gridOptionsService: GridOptionsService,
        column: Column | null,
        columnGroup: T['columnGroup']): T {
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
        } as T;
    }

    private static getColumnClassesFromCollDef<T extends HeaderClassParams | ToolPanelClassParams>(
        classesOrFunc: string | string[] | ((params: T) => string | string[] | undefined) | null | undefined,
        abstractColDef: AbstractColDef,
        gridOptionsService: GridOptionsService,
        column: Column | null,
        columnGroup: ColumnGroup | ProvidedColumnGroup | null
    ): string[] {
        if (missing(classesOrFunc)) { return []; }

        let classToUse: string | string[] | undefined;

        if (typeof classesOrFunc === 'function') {
            const params: T = this.getClassParams(abstractColDef, gridOptionsService, column, columnGroup);
            classToUse = classesOrFunc(params);
        } else {
            classToUse = classesOrFunc;
        }

        if (typeof classToUse === 'string') { return [classToUse]; }
        if (Array.isArray(classToUse)) { return [...classToUse]; }

        return [];
    }
}
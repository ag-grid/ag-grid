import { AbstractColDef, HeaderClassParams, ToolPanelClassParams } from "../../entities/colDef";
import { GridOptionsService } from "../../gridOptionsService";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ProvidedColumnGroup } from "../../entities/providedColumnGroup";
import { missing } from "../../utils/generic";
import { IAbstractHeaderCellComp } from "./abstractCell/abstractHeaderCellCtrl";
import { ICellComp } from "../../rendering/cell/cellCtrl";
import { ColumnModel } from "../../columns/columnModel";
import { WithoutGridCommon } from "../../interfaces/iCommon";

const CSS_FIRST_COLUMN = 'ag-column-first';
const CSS_LAST_COLUMN = 'ag-column-last';

export class CssClassApplier {

    public static getHeaderClassesFromColDef(
        abstractColDef: AbstractColDef | null,
        gos: GridOptionsService,
        column: Column | null,
        columnGroup: ColumnGroup | null
    ): string[] {
        if (missing(abstractColDef)) { return []; }

        return this.getColumnClassesFromCollDef(
            abstractColDef.headerClass,
            abstractColDef,
            gos,
            column,
            columnGroup
        );
    }

    public static getToolPanelClassesFromColDef(
        abstractColDef: AbstractColDef | null,
        gos: GridOptionsService,
        column: Column | null,
        columnGroup: ProvidedColumnGroup | null
    ): string[] {
        if (missing(abstractColDef)) { return []; }

        return this.getColumnClassesFromCollDef(
            abstractColDef.toolPanelClass,
            abstractColDef,
            gos,
            column,
            columnGroup
        );
    }

    public static refreshFirstAndLastStyles(comp: IAbstractHeaderCellComp | ICellComp, column: Column | ColumnGroup, columnModel: ColumnModel) {
        comp.addOrRemoveCssClass(CSS_FIRST_COLUMN, columnModel.isColumnAtEdge(column, 'first'));
        comp.addOrRemoveCssClass(CSS_LAST_COLUMN, columnModel.isColumnAtEdge(column, 'last'));
    }

    private static getClassParams<T extends HeaderClassParams | ToolPanelClassParams>(abstractColDef: AbstractColDef,
        gos: GridOptionsService,
        column: Column | null,
        columnGroup: T['columnGroup']): T {
        return gos.addGridCommonParams({
            // bad naming, as colDef here can be a group or a column,
            // however most people won't appreciate the difference,
            // so keeping it as colDef to avoid confusion.
            colDef: abstractColDef,
            column: column,
            columnGroup: columnGroup
        } as WithoutGridCommon<T>);
    }

    private static getColumnClassesFromCollDef<T extends HeaderClassParams | ToolPanelClassParams>(
        classesOrFunc: string | string[] | ((params: T) => string | string[] | undefined) | null | undefined,
        abstractColDef: AbstractColDef,
        gos: GridOptionsService,
        column: Column | null,
        columnGroup: ColumnGroup | ProvidedColumnGroup | null
    ): string[] {
        if (missing(classesOrFunc)) { return []; }

        let classToUse: string | string[] | undefined;

        if (typeof classesOrFunc === 'function') {
            const params: T = this.getClassParams(abstractColDef, gos, column, columnGroup);
            classToUse = classesOrFunc(params);
        } else {
            classToUse = classesOrFunc;
        }

        if (typeof classToUse === 'string') { return [classToUse]; }
        if (Array.isArray(classToUse)) { return [...classToUse]; }

        return [];
    }
}
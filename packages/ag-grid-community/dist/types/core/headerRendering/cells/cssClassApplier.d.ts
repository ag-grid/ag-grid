import { AbstractColDef } from "../../entities/colDef";
import { GridOptionsService } from "../../gridOptionsService";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ProvidedColumnGroup } from "../../entities/providedColumnGroup";
import { IAbstractHeaderCellComp } from "./abstractCell/abstractHeaderCellCtrl";
import { ICellComp } from "../../rendering/cell/cellCtrl";
import { ColumnModel } from "../../columns/columnModel";
export declare class CssClassApplier {
    static getHeaderClassesFromColDef(abstractColDef: AbstractColDef | null, gos: GridOptionsService, column: Column | null, columnGroup: ColumnGroup | null): string[];
    static getToolPanelClassesFromColDef(abstractColDef: AbstractColDef | null, gos: GridOptionsService, column: Column | null, columnGroup: ProvidedColumnGroup | null): string[];
    static refreshFirstAndLastStyles(comp: IAbstractHeaderCellComp | ICellComp, column: Column | ColumnGroup, columnModel: ColumnModel): void;
    private static getClassParams;
    private static getColumnClassesFromCollDef;
}

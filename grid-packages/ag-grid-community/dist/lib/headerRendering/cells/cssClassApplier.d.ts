import { AbstractColDef } from "../../entities/colDef";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ProvidedColumnGroup } from "../../entities/providedColumnGroup";
export declare class CssClassApplier {
    static getHeaderClassesFromColDef(abstractColDef: AbstractColDef | null, gridOptionsWrapper: GridOptionsWrapper, column: Column | null, columnGroup: ColumnGroup | null): string[];
    static getToolPanelClassesFromColDef(abstractColDef: AbstractColDef | null, gridOptionsWrapper: GridOptionsWrapper, column: Column | null, columnGroup: ProvidedColumnGroup | null): string[];
    private static getColumnClassesFromCollDef;
}

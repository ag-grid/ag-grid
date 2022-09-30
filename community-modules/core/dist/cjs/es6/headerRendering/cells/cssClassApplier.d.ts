// Type definitions for @ag-grid-community/core v28.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AbstractColDef } from "../../entities/colDef";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ProvidedColumnGroup } from "../../entities/providedColumnGroup";
export declare class CssClassApplier {
    static getHeaderClassesFromColDef(abstractColDef: AbstractColDef | null, gridOptionsWrapper: GridOptionsWrapper, column: Column | null, columnGroup: ColumnGroup | null): string[];
    static getToolPanelClassesFromColDef(abstractColDef: AbstractColDef | null, gridOptionsWrapper: GridOptionsWrapper, column: Column | null, columnGroup: ProvidedColumnGroup | null): string[];
    private static getClassParams;
    private static getColumnClassesFromCollDef;
}

// Type definitions for @ag-grid-community/core v29.3.5
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AbstractColDef } from "../../entities/colDef";
import { GridOptionsService } from "../../gridOptionsService";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { ProvidedColumnGroup } from "../../entities/providedColumnGroup";
export declare class CssClassApplier {
    static getHeaderClassesFromColDef(abstractColDef: AbstractColDef | null, gridOptionsService: GridOptionsService, column: Column | null, columnGroup: ColumnGroup | null): string[];
    static getToolPanelClassesFromColDef(abstractColDef: AbstractColDef | null, gridOptionsService: GridOptionsService, column: Column | null, columnGroup: ProvidedColumnGroup | null): string[];
    private static getClassParams;
    private static getColumnClassesFromCollDef;
}

// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AbstractColDef, HeaderClassParams, ToolPanelClassParams } from "../entities/colDef";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColumnGroup } from "../entities/columnGroup";
import { Column } from "../entities/column";
import { OriginalColumnGroup } from "../entities/originalColumnGroup";
export declare class CssClassApplier {
    static addHeaderClassesFromColDef(abstractColDef: AbstractColDef | null, eHeaderCell: HTMLElement, gridOptionsWrapper: GridOptionsWrapper, column: Column | null, columnGroup: ColumnGroup | null): void;
    static addToolPanelClassesFromColDef(abstractColDef: AbstractColDef | null, eHeaderCell: HTMLElement, gridOptionsWrapper: GridOptionsWrapper, column: Column | null, columnGroup: OriginalColumnGroup | null): void;
    static addColumnClassesFromCollDef(classesOrFunc: string | string[] | ((params: HeaderClassParams | ToolPanelClassParams) => string | string[]) | null | undefined, abstractColDef: AbstractColDef, eHeaderCell: HTMLElement, gridOptionsWrapper: GridOptionsWrapper, column: Column | null, columnGroup: ColumnGroup | OriginalColumnGroup | null): void;
}

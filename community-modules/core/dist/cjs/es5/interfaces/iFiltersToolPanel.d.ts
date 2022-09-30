// Type definitions for @ag-grid-community/core v28.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColDef } from "../entities/colDef";
import { IToolPanel } from "./iToolPanel";
export interface IFiltersToolPanel extends IToolPanel {
    setFilterLayout(colDefs: ColDef[]): void;
    expandFilterGroups(groupIds?: string[]): void;
    collapseFilterGroups(groupIds?: string[]): void;
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
    syncLayoutWithGrid(): void;
}

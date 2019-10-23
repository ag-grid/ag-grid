// Type definitions for @ag-community/grid-core v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColDef } from "../entities/colDef";
export interface IFiltersToolPanel {
    setFilterLayout(colDefs: ColDef[]): void;
    expandFilterGroups(groupIds?: string[]): void;
    collapseFilterGroups(groupIds?: string[]): void;
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
    syncLayoutWithGrid(): void;
}

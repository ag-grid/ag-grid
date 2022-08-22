import { ColDef } from "../entities/colDef";
export interface IFiltersToolPanel {
    setFilterLayout(colDefs: ColDef[]): void;
    expandFilterGroups(groupIds?: string[]): void;
    collapseFilterGroups(groupIds?: string[]): void;
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
    syncLayoutWithGrid(): void;
}

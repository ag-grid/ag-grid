import { ColDef } from "../entities/colDef";
import { FiltersToolPanelState } from "./gridState";
import { IToolPanel } from "./iToolPanel";
export interface IFiltersToolPanel extends IToolPanel {
    setFilterLayout(colDefs: ColDef[]): void;
    expandFilterGroups(groupIds?: string[]): void;
    collapseFilterGroups(groupIds?: string[]): void;
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
    syncLayoutWithGrid(): void;
    getState(): FiltersToolPanelState;
}

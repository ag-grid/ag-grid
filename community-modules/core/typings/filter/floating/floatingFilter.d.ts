import { IComponent } from "../../interfaces/iComponent";
import { Column } from "../../entities/column";
import { GridApi } from "../../gridApi";
import { ProvidedFilterModel, IFilterComp, IFilterParams } from "../../interfaces/iFilter";
import { FilterChangedEvent } from "../../events";
export interface IFloatingFilterParams {
    column: Column;
    filterParams: IFilterParams;
    currentParentModel: () => any;
    parentFilterInstance: (callback: (filterInstance: IFilterComp) => void) => void;
    suppressFilterButton: boolean;
    api: GridApi;
    /** @deprecated in v21, use parentFilterInstance() callback instead and tell filter directly */
    onFloatingFilterChanged: (change: any) => boolean;
}
export interface IFloatingFilter {
    onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent): void;
}
export interface IFloatingFilterComp extends IFloatingFilter, IComponent<IFloatingFilterParams> {
}
export interface BaseFloatingFilterChange {
    model: ProvidedFilterModel;
    apply: boolean;
}

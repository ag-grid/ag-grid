import {IComponent} from "../../interfaces/iComponent";
import {Column} from "../../entities/column";
import {GridApi} from "../../gridApi";
import {FilterModel, IFilterComp, IFilterParams} from "../../interfaces/iFilter";
import {FilterChangedEvent} from "../../events";

export interface IFloatingFilterParams {
    column: Column;
    filterParams: IFilterParams,
    onFloatingFilterChanged: (change: any) => boolean;
    currentParentModel: () => any;
    parentFilterInstance: ( callback: (filterInstance: IFilterComp)=>void ) => void;
    suppressFilterButton: boolean;
    debounceMs?: number;
    api: GridApi;
}

export interface IFloatingFilter {
    onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent): void;
}

export interface IFloatingFilterComp extends IFloatingFilter, IComponent<IFloatingFilterParams> {
}

export interface BaseFloatingFilterChange {
    model: FilterModel;
    apply: boolean;
}

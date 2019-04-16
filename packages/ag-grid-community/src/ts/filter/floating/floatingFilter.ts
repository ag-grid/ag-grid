import {IComponent} from "../../interfaces/iComponent";
import {Column} from "../../entities/column";
import {GridApi} from "../../gridApi";
import {SerializedSetFilter} from "../../interfaces/iSerializedSetFilter";
import {CombinedFilter} from "../provided/abstractFilter";
import {AbstractTextFloatingFilterComp} from "./abstractTextFloatingFilter";

export interface FloatingFilterChange {
}

export interface IFloatingFilterParams<M, F extends FloatingFilterChange> {
    column: Column;
    onFloatingFilterChanged: (change: F | M) => boolean;
    currentParentModel: () => M;
    suppressFilterButton: boolean;
    debounceMs?: number;
    api: GridApi;
}

export interface IFloatingFilter<M, F extends FloatingFilterChange, P extends IFloatingFilterParams<M, F>> {
    onParentModelChanged(parentModel: M, combinedModel?:CombinedFilter<M>): void;
}

export interface IFloatingFilterComp<M, F extends FloatingFilterChange, P extends IFloatingFilterParams<M, F>> extends IFloatingFilter<M, F, P>, IComponent<P> {
}

export interface BaseFloatingFilterChange<M> extends FloatingFilterChange {
    model: M;
    apply: boolean;
}

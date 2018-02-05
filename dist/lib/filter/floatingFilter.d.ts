// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { SerializedTextFilter } from "./textFilter";
import { SerializedDateFilter } from "./dateFilter";
import { SerializedNumberFilter } from "./numberFilter";
import { IComponent } from "../interfaces/iComponent";
import { Component } from "../widgets/component";
import { Column } from "../entities/column";
import { GridApi } from "../gridApi";
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
    onParentModelChanged(parentModel: M): void;
}
export interface IFloatingFilterComp<M, F extends FloatingFilterChange, P extends IFloatingFilterParams<M, F>> extends IFloatingFilter<M, F, P>, IComponent<P> {
}
export interface BaseFloatingFilterChange<M> extends FloatingFilterChange {
    model: M;
    apply: boolean;
}
export declare abstract class InputTextFloatingFilterComp<M, P extends IFloatingFilterParams<M, BaseFloatingFilterChange<M>>> extends Component implements IFloatingFilter<M, BaseFloatingFilterChange<M>, P> {
    eColumnFloatingFilter: HTMLInputElement;
    onFloatingFilterChanged: (change: BaseFloatingFilterChange<M>) => boolean;
    currentParentModel: () => M;
    lastKnownModel: M;
    constructor();
    init(params: P): void;
    abstract asParentModel(): M;
    abstract asFloatingFilterText(parentModel: M): string;
    onParentModelChanged(parentModel: M): void;
    syncUpWithParentFilter(e: KeyboardEvent): void;
    equalModels(left: any, right: any): boolean;
}
export declare class TextFloatingFilterComp extends InputTextFloatingFilterComp<SerializedTextFilter, IFloatingFilterParams<SerializedTextFilter, BaseFloatingFilterChange<SerializedTextFilter>>> {
    asFloatingFilterText(parentModel: SerializedTextFilter): string;
    asParentModel(): SerializedTextFilter;
}
export declare class DateFloatingFilterComp extends Component implements IFloatingFilter<SerializedDateFilter, BaseFloatingFilterChange<SerializedDateFilter>, IFloatingFilterParams<SerializedDateFilter, BaseFloatingFilterChange<SerializedDateFilter>>> {
    private componentRecipes;
    private dateComponentPromise;
    onFloatingFilterChanged: (change: BaseFloatingFilterChange<SerializedDateFilter>) => void;
    currentParentModel: () => SerializedDateFilter;
    lastKnownModel: SerializedDateFilter;
    init(params: IFloatingFilterParams<SerializedDateFilter, BaseFloatingFilterChange<SerializedDateFilter>>): void;
    private onDateChanged();
    equalModels(left: SerializedDateFilter, right: SerializedDateFilter): boolean;
    asParentModel(): SerializedDateFilter;
    onParentModelChanged(parentModel: SerializedDateFilter): void;
}
export declare class NumberFloatingFilterComp extends InputTextFloatingFilterComp<SerializedNumberFilter, IFloatingFilterParams<SerializedNumberFilter, BaseFloatingFilterChange<SerializedNumberFilter>>> {
    asFloatingFilterText(parentModel: SerializedNumberFilter): string;
    asParentModel(): SerializedNumberFilter;
    private asNumber(value);
}
export declare class SetFloatingFilterComp extends InputTextFloatingFilterComp<string[], IFloatingFilterParams<string[], BaseFloatingFilterChange<string[]>>> {
    init(params: IFloatingFilterParams<string[], BaseFloatingFilterChange<string[]>>): void;
    asFloatingFilterText(parentModel: string[]): string;
    asParentModel(): string[];
}
export declare class ReadModelAsStringFloatingFilterComp extends InputTextFloatingFilterComp<string, IFloatingFilterParams<string, BaseFloatingFilterChange<string>>> {
    init(params: IFloatingFilterParams<string, BaseFloatingFilterChange<string>>): void;
    onParentModelChanged(parentModel: any): void;
    asFloatingFilterText(parentModel: string): string;
    asParentModel(): string;
}

// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { SerializedTextFilter } from "./textFilter";
import { SerializedDateFilter } from "./dateFilter";
import { SerializedNumberFilter } from "./numberFilter";
import { IComponent } from "../interfaces/iComponent";
import { Component } from "../widgets/component";
import { Column } from "../entities/column";
import { GridApi } from "../gridApi";
import { SerializedSetFilter } from "../interfaces/iSerializedSetFilter";
import { CombinedFilter } from "./baseFilter";
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
    onParentModelChanged(parentModel: M, combinedModel?: CombinedFilter<M>): void;
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
    abstract parseAsText(model: M): string;
    onParentModelChanged(parentModel: M, combinedFilter?: CombinedFilter<M>): void;
    syncUpWithParentFilter(e: KeyboardEvent): void;
    equalModels(left: any, right: any): boolean;
}
export declare class TextFloatingFilterComp extends InputTextFloatingFilterComp<SerializedTextFilter, IFloatingFilterParams<SerializedTextFilter, BaseFloatingFilterChange<SerializedTextFilter>>> {
    asFloatingFilterText(parentModel: SerializedTextFilter): string;
    asParentModel(): SerializedTextFilter;
    parseAsText(model: SerializedTextFilter): string;
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
    private enrichDateInput(type, dateFrom, dateTo, dateComponent);
}
export declare class NumberFloatingFilterComp extends InputTextFloatingFilterComp<SerializedNumberFilter, IFloatingFilterParams<SerializedNumberFilter, BaseFloatingFilterChange<SerializedNumberFilter>>> {
    asFloatingFilterText(toParse: SerializedNumberFilter): string;
    parseAsText(model: SerializedNumberFilter): string;
    asParentModel(): SerializedNumberFilter;
    private asNumber(value);
}
export declare class SetFloatingFilterComp extends InputTextFloatingFilterComp<SerializedSetFilter, IFloatingFilterParams<SerializedSetFilter, BaseFloatingFilterChange<SerializedSetFilter>>> {
    init(params: IFloatingFilterParams<SerializedSetFilter, BaseFloatingFilterChange<SerializedSetFilter>>): void;
    asFloatingFilterText(parentModel: string[] | SerializedSetFilter): string;
    parseAsText(model: SerializedSetFilter): string;
    asParentModel(): SerializedSetFilter;
    equalModels(left: SerializedSetFilter, right: SerializedSetFilter): boolean;
}
export declare class ReadModelAsStringFloatingFilterComp extends InputTextFloatingFilterComp<string, IFloatingFilterParams<string, BaseFloatingFilterChange<string>>> {
    init(params: IFloatingFilterParams<string, BaseFloatingFilterChange<string>>): void;
    onParentModelChanged(parentModel: any): void;
    asFloatingFilterText(parentModel: string): string;
    parseAsText(model: string): string;
    asParentModel(): string;
}

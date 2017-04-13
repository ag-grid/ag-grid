// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { SerializedTextFilter } from "./textFilter";
import { SerializedDateFilter } from "./dateFilter";
import { SerializedNumberFilter } from "./numberFilter";
import { IComponent } from "../interfaces/iComponent";
import { Component } from "../widgets/component";
export interface FloatingFilterChange {
}
export interface IFloatingFilterParams<M, F extends FloatingFilterChange> {
    onFloatingFilterChanged: (change: F | M) => void;
    currentParentModel: () => M;
    suppressFilterButton: boolean;
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
    onFloatingFilterChanged: (change: BaseFloatingFilterChange<M>) => void;
    currentParentModel: () => M;
    constructor();
    init(params: P): void;
    abstract asParentModel(): M;
    abstract asFloatingFilterText(parentModel: M): string;
    onParentModelChanged(parentModel: M): void;
    syncUpWithParentFilter(): void;
    checkApply(e: KeyboardEvent): void;
}
export declare class TextFloatingFilterComp extends InputTextFloatingFilterComp<SerializedTextFilter, IFloatingFilterParams<SerializedTextFilter, BaseFloatingFilterChange<SerializedTextFilter>>> {
    asFloatingFilterText(parentModel: SerializedTextFilter): string;
    asParentModel(): SerializedTextFilter;
}
export declare class DateFloatingFilterComp extends Component implements IFloatingFilter<SerializedDateFilter, BaseFloatingFilterChange<SerializedDateFilter>, IFloatingFilterParams<SerializedDateFilter, BaseFloatingFilterChange<SerializedDateFilter>>> {
    private componentProvider;
    private dateComponent;
    onFloatingFilterChanged: (change: BaseFloatingFilterChange<SerializedDateFilter>) => void;
    currentParentModel: () => SerializedDateFilter;
    init(params: IFloatingFilterParams<SerializedDateFilter, BaseFloatingFilterChange<SerializedDateFilter>>): void;
    private onDateChanged();
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

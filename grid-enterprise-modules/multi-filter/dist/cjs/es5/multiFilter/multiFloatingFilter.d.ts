import { Component, FilterChangedEvent, IFloatingFilterComp, IFloatingFilterParams, AgPromise, IMultiFilterModel } from '@ag-grid-community/core';
import { MultiFilter } from './multiFilter';
export declare class MultiFloatingFilterComp extends Component implements IFloatingFilterComp<MultiFilter> {
    private readonly userComponentFactory;
    private floatingFilters;
    private params;
    constructor();
    init(params: IFloatingFilterParams<MultiFilter>): AgPromise<void>;
    onParentModelChanged(model: IMultiFilterModel, event: FilterChangedEvent): void;
    destroy(): void;
    private createFloatingFilter;
    private parentMultiFilterInstance;
}

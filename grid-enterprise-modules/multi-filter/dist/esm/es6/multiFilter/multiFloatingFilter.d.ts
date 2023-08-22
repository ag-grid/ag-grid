import { Component, FilterChangedEvent, IFloatingFilterComp, IFloatingFilterParams, AgPromise, IMultiFilterModel } from '@ag-grid-community/core';
import { MultiFilter } from './multiFilter';
export declare class MultiFloatingFilterComp extends Component implements IFloatingFilterComp<MultiFilter> {
    private readonly userComponentFactory;
    private readonly filterManager;
    private floatingFilters;
    private compDetailsList;
    private params;
    constructor();
    init(params: IFloatingFilterParams<MultiFilter>): AgPromise<void>;
    private setParams;
    onParamsUpdated(params: IFloatingFilterParams<MultiFilter>): void;
    private getCompDetailsList;
    onParentModelChanged(model: IMultiFilterModel, event: FilterChangedEvent): void;
    destroy(): void;
    private getCompDetails;
    private parentMultiFilterInstance;
}

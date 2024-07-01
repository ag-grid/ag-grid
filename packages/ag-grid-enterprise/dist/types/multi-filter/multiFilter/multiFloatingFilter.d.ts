import type { BeanCollection, FilterChangedEvent, IFloatingFilterComp, IFloatingFilterParams, IMultiFilterModel } from 'ag-grid-community';
import { AgPromise, Component } from 'ag-grid-community';
import { MultiFilter } from './multiFilter';
export declare class MultiFloatingFilterComp extends Component implements IFloatingFilterComp<MultiFilter> {
    private userComponentFactory;
    private filterManager?;
    wireBeans(beans: BeanCollection): void;
    private floatingFilters;
    private compDetailsList;
    private params;
    constructor();
    init(params: IFloatingFilterParams<MultiFilter>): AgPromise<void>;
    private setParams;
    onParamsUpdated(params: IFloatingFilterParams<MultiFilter>): void;
    refresh(params: IFloatingFilterParams<MultiFilter>): void;
    private getCompDetailsList;
    onParentModelChanged(model: IMultiFilterModel, event: FilterChangedEvent): void;
    destroy(): void;
    private getCompDetails;
    private parentMultiFilterInstance;
}

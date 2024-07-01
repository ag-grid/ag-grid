import type { BeanCollection, IFloatingFilter, IFloatingFilterParams, SetFilterModel } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class SetFloatingFilterComp<V = string> extends Component implements IFloatingFilter {
    private columnNameService;
    private readonly eFloatingFilterText;
    wireBeans(beans: BeanCollection): void;
    private params;
    private availableValuesListenerAdded;
    private readonly filterModelFormatter;
    constructor();
    destroy(): void;
    init(params: IFloatingFilterParams): void;
    private setParams;
    onParamsUpdated(params: IFloatingFilterParams): void;
    refresh(params: IFloatingFilterParams): void;
    onParentModelChanged(parentModel: SetFilterModel): void;
    private parentSetFilterInstance;
    private addAvailableValuesListener;
    private updateFloatingFilterText;
}

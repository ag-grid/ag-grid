import { Component, IFloatingFilter, IFloatingFilterParams, SetFilterModel } from 'ag-grid-community';
export declare class SetFloatingFilterComp extends Component implements IFloatingFilter {
    private readonly eFloatingFilterText;
    private readonly valueFormatterService;
    private readonly columnModel;
    private params;
    private availableValuesListenerAdded;
    constructor();
    destroy(): void;
    init(params: IFloatingFilterParams): void;
    onParentModelChanged(parentModel: SetFilterModel): void;
    private parentSetFilterInstance;
    private addAvailableValuesListener;
    private updateFloatingFilterText;
}

import { Component, IFloatingFilter, IFloatingFilterParams } from '@ag-grid-community/core';
import { SetFilterModel } from './setFilterModel';
export declare class SetFloatingFilterComp extends Component implements IFloatingFilter {
    private eFloatingFilterText;
    private valueFormatterService;
    private gridOptionsWrapper;
    private columnController;
    private params;
    private lastKnownModel;
    private availableValuesListenerAdded;
    constructor();
    destroy(): void;
    init(params: IFloatingFilterParams): void;
    onParentModelChanged(parentModel: SetFilterModel): void;
    private addAvailableValuesListener;
    private updateSetFilterText;
}

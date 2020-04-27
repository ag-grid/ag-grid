import { FilterChangedEvent, Component, IFloatingFilter, IFloatingFilterParams } from 'ag-grid-community';
import { SetFilterModel } from './setFilterModel';
export declare class SetFloatingFilterComp extends Component implements IFloatingFilter {
    private eFloatingFilterText;
    private valueFormatterService;
    private params;
    private lastKnownModel;
    private availableValuesListenerAdded;
    constructor();
    init(params: IFloatingFilterParams): void;
    onAvailableValuesChanged(filterChangedEvent: FilterChangedEvent): void;
    onParentModelChanged(parentModel: SetFilterModel): void;
    private addAvailableValuesListener;
    private updateSetFilterText;
}

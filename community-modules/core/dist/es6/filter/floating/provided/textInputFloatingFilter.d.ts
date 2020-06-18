// Type definitions for @ag-grid-community/core v23.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IFloatingFilterParams } from '../floatingFilter';
import { ProvidedFilterModel } from '../../../interfaces/iFilter';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
export declare abstract class TextInputFloatingFilter extends SimpleFloatingFilter {
    private columnController;
    private eFloatingFilterInput;
    protected params: IFloatingFilterParams;
    private applyActive;
    private postConstruct;
    protected getDefaultDebounceMs(): number;
    onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void;
    init(params: IFloatingFilterParams): void;
    private syncUpWithParentFilter;
    protected setEditable(editable: boolean): void;
}

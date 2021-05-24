// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IFloatingFilterParams } from '../floatingFilter';
import { ProvidedFilterModel } from '../../../interfaces/iFilter';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
export declare abstract class TextInputFloatingFilter extends SimpleFloatingFilter {
    private readonly columnController;
    private readonly eFloatingFilterInput;
    protected params: IFloatingFilterParams;
    private applyActive;
    private postConstruct;
    protected getDefaultDebounceMs(): number;
    onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void;
    init(params: IFloatingFilterParams): void;
    private syncUpWithParentFilter;
    protected setEditable(editable: boolean): void;
}

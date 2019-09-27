// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../../widgets/component";
import { IFloatingFilterComp, IFloatingFilterParams } from "../floatingFilter";
import { ProvidedFilterModel } from "../../../interfaces/iFilter";
import { FilterChangedEvent } from "../../../events";
export declare abstract class SimpleFloatingFilter extends Component implements IFloatingFilterComp {
    abstract onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void;
    protected abstract conditionToString(condition: ProvidedFilterModel): string;
    protected abstract getDefaultFilterOptions(): string[];
    protected abstract setEditable(editable: boolean): void;
    private lastType;
    private optionsFactory;
    protected getDefaultDebounceMs(): number;
    protected getTextFromModel(model: ProvidedFilterModel): string;
    protected isEventFromFloatingFilter(event: FilterChangedEvent): boolean;
    protected getLastType(): string;
    protected setLastTypeFromModel(model: ProvidedFilterModel): void;
    protected canWeEditAfterModelFromParentFilter(model: ProvidedFilterModel): boolean;
    init(params: IFloatingFilterParams): void;
    private doesFilterHaveHiddenInput;
    private isTypeEditable;
}

import { Component } from '../../../widgets/component';
import { IFloatingFilterComp, IFloatingFilterParams } from '../floatingFilter';
import { ProvidedFilterModel } from '../../../interfaces/iFilter';
import { FilterChangedEvent } from '../../../events';
export declare abstract class SimpleFloatingFilter extends Component implements IFloatingFilterComp {
    abstract onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void;
    protected abstract conditionToString(condition: ProvidedFilterModel): string;
    protected abstract getDefaultFilterOptions(): string[];
    protected abstract setEditable(editable: boolean): void;
    private lastType;
    private optionsFactory;
    protected getDefaultDebounceMs(): number;
    destroy(): void;
    protected getTextFromModel(model: ProvidedFilterModel): string | null;
    protected isEventFromFloatingFilter(event: FilterChangedEvent): boolean | undefined;
    protected getLastType(): string | null | undefined;
    protected setLastTypeFromModel(model: ProvidedFilterModel): void;
    protected canWeEditAfterModelFromParentFilter(model: ProvidedFilterModel): boolean;
    init(params: IFloatingFilterParams): void;
    private doesFilterHaveHiddenInput;
    private isTypeEditable;
}

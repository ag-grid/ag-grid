import { Component } from '../../../widgets/component';
import { IFloatingFilterComp, IFloatingFilterParams } from '../floatingFilter';
import { IFilterOptionDef, ProvidedFilterModel } from '../../../interfaces/iFilter';
import { ISimpleFilter, ISimpleFilterModel } from '../../provided/simpleFilter';
import { FilterChangedEvent } from '../../../events';
export declare abstract class SimpleFloatingFilter extends Component implements IFloatingFilterComp<ISimpleFilter> {
    abstract onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void;
    protected abstract conditionToString(condition: ProvidedFilterModel, opts?: IFilterOptionDef): string;
    protected abstract getDefaultFilterOptions(): string[];
    protected abstract setEditable(editable: boolean): void;
    private lastType;
    private optionsFactory;
    private readOnly;
    protected getDefaultDebounceMs(): number;
    destroy(): void;
    protected getTextFromModel(model: ISimpleFilterModel): string | null;
    protected isEventFromFloatingFilter(event: FilterChangedEvent): boolean | undefined;
    protected getLastType(): string | null | undefined;
    protected isReadOnly(): boolean;
    protected setLastTypeFromModel(model: ProvidedFilterModel): void;
    protected canWeEditAfterModelFromParentFilter(model: ProvidedFilterModel): boolean;
    init(params: IFloatingFilterParams): void;
    private doesFilterHaveSingleInput;
    private isTypeEditable;
}

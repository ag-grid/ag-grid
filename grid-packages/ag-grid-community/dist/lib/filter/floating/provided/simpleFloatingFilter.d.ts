import { Component } from '../../../widgets/component';
import { IFloatingFilterComp, IFloatingFilterParams } from '../floatingFilter';
import { ProvidedFilterModel } from '../../../interfaces/iFilter';
import { ISimpleFilter, SimpleFilterModelFormatter } from '../../provided/simpleFilter';
import { OptionsFactory } from '../../provided/optionsFactory';
import { FilterChangedEvent } from '../../../events';
export declare abstract class SimpleFloatingFilter extends Component implements IFloatingFilterComp<ISimpleFilter> {
    abstract onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void;
    protected abstract getDefaultFilterOptions(): string[];
    protected abstract setEditable(editable: boolean): void;
    protected abstract getFilterModelFormatter(): SimpleFilterModelFormatter;
    private lastType;
    protected optionsFactory: OptionsFactory;
    private readOnly;
    protected getDefaultDebounceMs(): number;
    destroy(): void;
    protected isEventFromFloatingFilter(event: FilterChangedEvent): boolean | undefined;
    protected isEventFromDataChange(event: FilterChangedEvent): boolean | undefined;
    protected getLastType(): string | null | undefined;
    protected isReadOnly(): boolean;
    protected setLastTypeFromModel(model: ProvidedFilterModel): void;
    protected canWeEditAfterModelFromParentFilter(model: ProvidedFilterModel): boolean;
    init(params: IFloatingFilterParams): void;
    private setSimpleParams;
    onParamsUpdated(params: IFloatingFilterParams): void;
    refresh(params: IFloatingFilterParams): void;
    private doesFilterHaveSingleInput;
    private isTypeEditable;
}

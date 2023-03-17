import { DateFilter } from './dateFilter';
import { IFloatingFilterParams } from '../../floating/floatingFilter';
import { ISimpleFilterModel, SimpleFilterModelFormatter } from '../simpleFilter';
import { SimpleFloatingFilter } from '../../floating/provided/simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
export declare class DateFloatingFilter extends SimpleFloatingFilter {
    private readonly userComponentFactory;
    private readonly eReadOnlyText;
    private readonly eDateWrapper;
    private dateComp;
    private params;
    private filterParams;
    private filterModelFormatter;
    constructor();
    protected getDefaultFilterOptions(): string[];
    init(params: IFloatingFilterParams<DateFilter>): void;
    protected setEditable(editable: boolean): void;
    onParentModelChanged(model: ISimpleFilterModel, event: FilterChangedEvent): void;
    private onDateChanged;
    private createDateComponent;
    protected getFilterModelFormatter(): SimpleFilterModelFormatter;
}

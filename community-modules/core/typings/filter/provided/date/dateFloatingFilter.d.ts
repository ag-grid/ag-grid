import { DateFilterModel } from './dateFilter';
import { IFloatingFilterParams } from '../../floating/floatingFilter';
import { ISimpleFilterModel } from '../simpleFilter';
import { SimpleFloatingFilter } from '../../floating/provided/simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
import { IFilterOptionDef } from '../../../interfaces/iFilter';
export declare class DateFloatingFilter extends SimpleFloatingFilter {
    private readonly userComponentFactory;
    private readonly eReadOnlyText;
    private readonly eDateWrapper;
    private dateComp;
    private params;
    private filterParams;
    constructor();
    protected getDefaultFilterOptions(): string[];
    protected conditionToString(condition: DateFilterModel, options?: IFilterOptionDef): string;
    init(params: IFloatingFilterParams): void;
    protected setEditable(editable: boolean): void;
    onParentModelChanged(model: ISimpleFilterModel, event: FilterChangedEvent): void;
    private onDateChanged;
    private createDateComponent;
}

import { ConditionPosition, ISimpleFilterModel } from '../simpleFilter';
import { Comparator, IScalarFilterParams, ScalarFilter } from '../scalarFilter';
import { Promise } from '../../../utils';
export interface DateFilterModel extends ISimpleFilterModel {
    dateFrom: string;
    dateTo: string;
}
export interface IDateFilterParams extends IScalarFilterParams {
    comparator?: IDateComparatorFunc;
    browserDatePicker?: boolean;
    minValidYear?: number;
}
export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight: Date, cellValue: any): number;
}
export declare class DateFilter extends ScalarFilter<DateFilterModel, Date> {
    static DEFAULT_FILTER_OPTIONS: string[];
    private readonly eCondition1PanelFrom;
    private readonly eCondition1PanelTo;
    private readonly eCondition2PanelFrom;
    private readonly eCondition2PanelTo;
    private dateCondition1FromComp;
    private dateCondition1ToComp;
    private dateCondition2FromComp;
    private dateCondition2ToComp;
    private readonly userComponentFactory;
    private dateFilterParams;
    constructor();
    protected mapRangeFromModel(filterModel: DateFilterModel): {
        from: Date;
        to: Date;
    };
    protected setValueFromFloatingFilter(value: string): void;
    protected setConditionIntoUi(model: DateFilterModel, position: ConditionPosition): void;
    protected resetUiToDefaults(silent?: boolean): Promise<void>;
    protected comparator(): Comparator<Date>;
    private defaultComparator;
    protected setParams(params: IDateFilterParams): void;
    private createDateComponents;
    protected getDefaultFilterOptions(): string[];
    protected createValueTemplate(position: ConditionPosition): string;
    protected isConditionUiComplete(position: ConditionPosition): boolean;
    protected areSimpleModelsEqual(aSimple: DateFilterModel, bSimple: DateFilterModel): boolean;
    protected getFilterType(): string;
    protected createCondition(position: ConditionPosition): DateFilterModel;
    private resetPlaceholder;
    protected updateUiVisibility(): void;
    private getFromToComponents;
}

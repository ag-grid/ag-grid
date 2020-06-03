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
}
export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight: Date, cellValue: any): number;
}
export declare class DateFilter extends ScalarFilter<DateFilterModel, Date> {
    private static readonly FILTER_TYPE;
    static DEFAULT_FILTER_OPTIONS: string[];
    private eCondition1PanelFrom;
    private eCondition1PanelTo;
    private eCondition2PanelFrom;
    private eCondition2PanelTo;
    private dateCondition1FromComp;
    private dateCondition1ToComp;
    private dateCondition2FromComp;
    private dateCondition2ToComp;
    private userComponentFactory;
    private dateFilterParams;
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

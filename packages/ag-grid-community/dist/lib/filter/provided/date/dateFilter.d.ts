// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ConditionPosition, ISimpleFilterModel } from "../simpleFilter";
import { IDateComparatorFunc } from "./dateFilter";
import { Comparator, IScalarFilterParams, ScalerFilter } from "../scalerFilter";
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
export declare class DateFilter extends ScalerFilter<DateFilterModel, Date> {
    private static readonly FILTER_TYPE;
    static DEFAULT_FILTER_OPTIONS: string[];
    private ePanelFrom1;
    private ePanelFrom2;
    private ePanelTo1;
    private ePanelTo2;
    private dateCompFrom1;
    private dateCompFrom2;
    private dateCompTo1;
    private dateCompTo2;
    private userComponentFactory;
    private dateFilterParams;
    protected mapRangeFromModel(filterModel: DateFilterModel): {
        from: Date;
        to: Date;
    };
    protected setValueFromFloatingFilter(value: string): void;
    protected setConditionIntoUi(model: DateFilterModel, position: ConditionPosition): void;
    protected resetUiToDefaults(): void;
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
    protected updateUiVisibility(): void;
}

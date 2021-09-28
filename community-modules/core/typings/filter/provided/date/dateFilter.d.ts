import { ConditionPosition, ISimpleFilterModel } from '../simpleFilter';
import { Comparator, IScalarFilterParams, ScalarFilter } from '../scalarFilter';
import { AgPromise } from '../../../utils';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
export interface DateFilterModel extends ISimpleFilterModel {
    /** Filter type is always `'date'` */
    filterType?: 'date';
    /**
     * The date value(s) associated with the filter.
     * The type is `string` and format is always `YYYY-MM-DD` e.g. 2019-05-24.
     * Custom filters can have no values (hence both are optional).
     * Range filter has two values (from and to).
     */
    dateFrom: string | null;
    /**
     * Range filter `to` date value.
     */
    dateTo: string | null;
}
export interface IDateFilterParams extends IScalarFilterParams {
    /** Required if the data for the column are not native JS `Date` objects. */
    comparator?: IDateComparatorFunc;
    /**
     * This is only used if a date component is not provided.
     * By default the grid will use the browser date picker in Chrome and Firefox and a plain text box for all other browsers
     * (This is because Chrome and Firefox are the only current browsers providing a decent out-of-the-box date picker).
     * If this property is set to `true`, the browser date picker will be used regardless of the browser type.
     * If set to `false`, a plain text box will be used for all browsers.
     */
    browserDatePicker?: boolean;
    /** This is the minimum year that must be entered in a date field for the value to be considered valid. Default: `1000` */
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
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    protected mapRangeFromModel(filterModel: DateFilterModel): {
        from: Date | null;
        to: Date | null;
    };
    protected setValueFromFloatingFilter(value: string): void;
    protected setConditionIntoUi(model: DateFilterModel, position: ConditionPosition): void;
    protected resetUiToDefaults(silent?: boolean): AgPromise<void>;
    protected comparator(): Comparator<Date>;
    private defaultComparator;
    protected setParams(params: IDateFilterParams): void;
    private createDateComponents;
    protected getDefaultFilterOptions(): string[];
    protected createValueTemplate(position: ConditionPosition): string;
    protected isConditionUiComplete(position: ConditionPosition): boolean;
    protected areSimpleModelsEqual(aSimple: DateFilterModel, bSimple: DateFilterModel): boolean;
    protected getFilterType(): 'date';
    protected createCondition(position: ConditionPosition): DateFilterModel;
    private resetPlaceholder;
    protected updateUiVisibility(): void;
    private getFromToComponents;
}

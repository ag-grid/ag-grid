import { DateCompWrapper } from './dateCompWrapper';
import { ConditionPosition, ISimpleFilterModel, Tuple } from '../simpleFilter';
import { Comparator, IScalarFilterParams, ScalarFilter } from '../scalarFilter';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
export interface DateFilterModel extends ISimpleFilterModel {
    /** Filter type is always `'date'` */
    filterType?: 'date';
    /**
     * The date value(s) associated with the filter. The type is `string` and format is always
     * `YYYY-MM-DD hh:mm:ss` e.g. 2019-05-24 00:00:00. Custom filters can have no values (hence both
     * are optional). Range filter has two values (from and to).
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
    /** This is the minimum year that may be entered in a date field for the value to be considered valid. Default: `1000` */
    minValidYear?: number;
    /** This is the maximum year that may be entered in a date field for the value to be considered valid. Default is no restriction. */
    maxValidYear?: number;
    /**
     * Defines the date format for the floating filter text when an in range filter has been applied.
     *
     * Default: `YYYY-MM-DD`
     */
    inRangeFloatingFilterDateFormat?: string;
}
export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight: Date, cellValue: any): number;
}
export declare class DateFilter extends ScalarFilter<DateFilterModel, Date, DateCompWrapper> {
    static DEFAULT_FILTER_OPTIONS: import("../simpleFilter").ISimpleFilterModelType[];
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
    private minValidYear;
    private maxValidYear;
    constructor();
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    protected mapValuesFromModel(filterModel: DateFilterModel | null): Tuple<Date>;
    protected comparator(): Comparator<Date>;
    private defaultComparator;
    protected setParams(params: IDateFilterParams): void;
    private createDateComponents;
    protected setElementValue(element: DateCompWrapper, value: Date | null, silent?: boolean): void;
    protected setElementDisplayed(element: DateCompWrapper, displayed: boolean): void;
    protected setElementDisabled(element: DateCompWrapper, disabled: boolean): void;
    protected getDefaultFilterOptions(): string[];
    protected createValueTemplate(position: ConditionPosition): string;
    protected isConditionUiComplete(position: ConditionPosition): boolean;
    protected areSimpleModelsEqual(aSimple: DateFilterModel, bSimple: DateFilterModel): boolean;
    protected getFilterType(): 'date';
    protected createCondition(position: ConditionPosition): DateFilterModel;
    protected resetPlaceholder(): void;
    protected getInputs(): Tuple<DateCompWrapper>[];
    protected getValues(position: ConditionPosition): Tuple<Date>;
}

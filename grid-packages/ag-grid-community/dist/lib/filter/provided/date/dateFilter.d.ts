import { DateCompWrapper } from './dateCompWrapper';
import { ISimpleFilterModel, SimpleFilterModelFormatter, Tuple } from '../simpleFilter';
import { Comparator, IScalarFilterParams, ScalarFilter } from '../scalarFilter';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import { IFilterOptionDef, IFilterParams } from '../../../interfaces/iFilter';
import { LocaleService } from '../../../localeService';
import { OptionsFactory } from '../optionsFactory';
import { FILTER_LOCALE_TEXT } from '../../filterLocaleText';
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
/**
 * Parameters provided by the grid to the `init` method of a `DateFilter`.
 * Do not use in `colDef.filterParams` - see `IDateFilterParams` instead.
 */
export declare type DateFilterParams<TData = any> = IDateFilterParams & IFilterParams<TData>;
/**
 * Parameters used in `colDef.filterParams` to configure a Date Filter (`agDateColumnFilter`).
 */
export interface IDateFilterParams extends IScalarFilterParams {
    /** Required if the data for the column are not native JS `Date` objects. */
    comparator?: IDateComparatorFunc;
    /**
     * Defines whether the grid uses the browser date picker or a plain text box.
     *  - `true`: Force the browser date picker to be used.
     *  - `false`: Force a plain text box to be used.
     *
     * If a date component is not provided, then the grid will use the browser date picker
     * for all supported browsers and a plain text box for other browsers.
     */
    browserDatePicker?: boolean;
    /**
     * This is the minimum year that may be entered in a date field for the value to be considered valid.
     * @default 1000
     * */
    minValidYear?: number;
    /** This is the maximum year that may be entered in a date field for the value to be considered valid. Default is no restriction. */
    maxValidYear?: number;
    /**
     * The minimum valid date that can be entered in the filter.
     * It can be a Date object or a string in the format `YYYY-MM-DD`.
     * If set, this will override `minValidYear` - the minimum valid year setting.
     */
    minValidDate?: Date | string;
    /**
     * The maximum valid date that can be entered in the filter.
     * It can be a Date object or a string in the format `YYYY-MM-DD`.
     * If set, this will override `maxValidYear` - the maximum valid year setting.
     */
    maxValidDate?: Date | string;
    /**
     * Defines the date format for the floating filter text when an `inRange` filter has been applied.
     *
     * @default YYYY-MM-DD
     */
    inRangeFloatingFilterDateFormat?: string;
}
export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight: Date, cellValue: any): number;
}
export declare class DateFilterModelFormatter extends SimpleFilterModelFormatter {
    private dateFilterParams;
    constructor(dateFilterParams: DateFilterParams, localeService: LocaleService, optionsFactory: OptionsFactory);
    protected conditionToString(condition: DateFilterModel, options?: IFilterOptionDef): string;
    updateParams(params: {
        dateFilterParams: DateFilterParams;
        optionsFactory: OptionsFactory;
    }): void;
}
export declare class DateFilter extends ScalarFilter<DateFilterModel, Date, DateCompWrapper> {
    static DEFAULT_FILTER_OPTIONS: import("../simpleFilter").ISimpleFilterModelType[];
    private readonly eConditionPanelsFrom;
    private readonly eConditionPanelsTo;
    private readonly dateConditionFromComps;
    private readonly dateConditionToComps;
    private readonly userComponentFactory;
    private dateFilterParams;
    private minValidYear;
    private maxValidYear;
    private minValidDate;
    private maxValidDate;
    private filterModelFormatter;
    constructor();
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    protected mapValuesFromModel(filterModel: DateFilterModel | null): Tuple<Date>;
    protected comparator(): Comparator<Date>;
    private defaultComparator;
    protected setParams(params: DateFilterParams): void;
    createDateCompWrapper(element: HTMLElement): DateCompWrapper;
    protected setElementValue(element: DateCompWrapper, value: Date | null): void;
    protected setElementDisplayed(element: DateCompWrapper, displayed: boolean): void;
    protected setElementDisabled(element: DateCompWrapper, disabled: boolean): void;
    protected getDefaultFilterOptions(): string[];
    protected createValueElement(): HTMLElement;
    private createFromToElement;
    protected removeValueElements(startPosition: number, deleteCount?: number): void;
    protected removeDateComps(components: DateCompWrapper[], startPosition: number, deleteCount?: number): void;
    private isValidDateValue;
    protected isConditionUiComplete(position: number): boolean;
    protected areSimpleModelsEqual(aSimple: DateFilterModel, bSimple: DateFilterModel): boolean;
    protected getFilterType(): 'date';
    protected createCondition(position: number): DateFilterModel;
    protected resetPlaceholder(): void;
    protected getInputs(position: number): Tuple<DateCompWrapper>;
    protected getValues(position: number): Tuple<Date>;
    protected translate(key: keyof typeof FILTER_LOCALE_TEXT): string;
    getModelAsString(model: ISimpleFilterModel): string;
}

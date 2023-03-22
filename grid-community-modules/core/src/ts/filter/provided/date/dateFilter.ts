import { Autowired } from '../../../context/context';
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { DateCompWrapper } from './dateCompWrapper';
import { ISimpleFilterModel, SimpleFilter, SimpleFilterModelFormatter, Tuple } from '../simpleFilter';
import { Comparator, IScalarFilterParams, ScalarFilter } from '../scalarFilter';
import { serialiseDate, parseDateTimeFromString, dateToFormattedString } from '../../../utils/date';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import { IFilterOptionDef, IFilterParams } from '../../../interfaces/iFilter';
import { LocaleService } from '../../../localeService';
import { OptionsFactory } from '../optionsFactory';

// The date filter model takes strings, although the filter actually works with dates. This is because a Date object
// won't convert easily to JSON. When the model is used for doing the filtering, it's converted to a Date object.
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
export type DateFilterParams<TData = any> = IDateFilterParams & IFilterParams<TData>;

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
     * Default: `undefined` - If a date component is not provided, then the grid will use the browser date picker
     * for all supported browsers and a plain text box for other browsers.
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

const DEFAULT_MIN_YEAR = 1000;
const DEFAULT_MAX_YEAR = Infinity;

export class DateFilterModelFormatter extends SimpleFilterModelFormatter {
    constructor(
        private readonly dateFilterParams: DateFilterParams,
        localeService: LocaleService,
        optionsFactory: OptionsFactory
    ) {
        super(localeService, optionsFactory);
    }

    protected conditionToString(condition: DateFilterModel, options?: IFilterOptionDef): string {
        const { type } = condition;
        const { numberOfInputs } = options || {};
        const isRange = type == SimpleFilter.IN_RANGE || numberOfInputs === 2;

        const dateFrom = parseDateTimeFromString(condition.dateFrom);
        const dateTo = parseDateTimeFromString(condition.dateTo);

        const format = this.dateFilterParams.inRangeFloatingFilterDateFormat;
        if (isRange) {
            const formattedFrom = dateFrom !== null ? dateToFormattedString(dateFrom, format) : 'null';
            const formattedTo = dateTo !== null ? dateToFormattedString(dateTo, format) : 'null';
            return `${formattedFrom}-${formattedTo}`;
        }

        if (dateFrom != null) {
            return dateToFormattedString(dateFrom, format);
        }

        // cater for when the type doesn't need a value
        return `${type}`;
    }
}

export class DateFilter extends ScalarFilter<DateFilterModel, Date, DateCompWrapper> {
    public static DEFAULT_FILTER_OPTIONS = [
        ScalarFilter.EQUALS,
        ScalarFilter.GREATER_THAN,
        ScalarFilter.LESS_THAN,
        ScalarFilter.NOT_EQUAL,
        ScalarFilter.IN_RANGE,
        ScalarFilter.BLANK,
        ScalarFilter.NOT_BLANK,
    ];

    private readonly eConditionPanelsFrom: HTMLElement[] = [];
    private readonly eConditionPanelsTo: HTMLElement[] = [];

    private readonly dateConditionFromComps: DateCompWrapper[] = [];
    private readonly dateConditionToComps: DateCompWrapper[] = [];

    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private dateFilterParams: DateFilterParams;
    private minValidYear: number = DEFAULT_MIN_YEAR;
    private maxValidYear: number = DEFAULT_MAX_YEAR;
    private filterModelFormatter: DateFilterModelFormatter;

    constructor() {
        super('dateFilter');
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        this.dateConditionFromComps[0].afterGuiAttached(params);
    }

    protected mapValuesFromModel(filterModel: DateFilterModel | null): Tuple<Date> {
        // unlike the other filters, we do two things here:
        // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
        //    are in different locations in Date and Number filter models)
        // 2) convert the type (because Date filter uses Dates, however model is 'string')
        //
        // NOTE: The conversion of string to date also removes the timezone - i.e. when user picks
        //       a date from the UI, it will have timezone info in it. This is lost when creating
        //       the model. When we recreate the date again here, it's without a timezone.
        const { dateFrom, dateTo, type } = filterModel || {};
        return [
            dateFrom && parseDateTimeFromString(dateFrom) || null,
            dateTo && parseDateTimeFromString(dateTo) || null,
        ].slice(0, this.getNumberOfInputs(type));
    }

    protected comparator(): Comparator<Date> {
        return this.dateFilterParams.comparator ? this.dateFilterParams.comparator : this.defaultComparator.bind(this);
    }

    private defaultComparator(filterDate: Date, cellValue: any): number {
        // The default comparator assumes that the cellValue is a date
        const cellAsDate = cellValue as Date;

        if (cellValue == null || cellAsDate < filterDate) { return -1; }
        if (cellAsDate > filterDate) { return 1; }

        return 0;
    }

    protected setParams(params: DateFilterParams): void {
        this.dateFilterParams = params;

        super.setParams(params);

        const yearParser = (param: keyof DateFilterParams, fallback: number) => {
            if (params[param] != null) {
                if (!isNaN(params[param])) {
                    return params[param] == null ? fallback : Number(params[param]);
                } else {
                    console.warn(`AG Grid: DateFilter ${param} is not a number`);
                }
            }

            return fallback;
        };
        this.minValidYear = yearParser('minValidYear', DEFAULT_MIN_YEAR);
        this.maxValidYear = yearParser('maxValidYear', DEFAULT_MAX_YEAR);

        if (this.minValidYear > this.maxValidYear) {
            console.warn(`AG Grid: DateFilter minValidYear should be <= maxValidYear`);
        }

        this.filterModelFormatter = new DateFilterModelFormatter(this.dateFilterParams, this.localeService, this.optionsFactory);
    }

    createDateCompWrapper(element: HTMLElement): DateCompWrapper {
        const dateCompWrapper = new DateCompWrapper(
            this.getContext(),
            this.userComponentFactory,
            {
                onDateChanged: () => this.onUiChanged(),
                filterParams: this.dateFilterParams
            },
            element
        );
        this.addDestroyFunc(() => dateCompWrapper.destroy());
        return dateCompWrapper;
    }

    protected setElementValue(element: DateCompWrapper, value: Date | null): void {
        element.setDate(value);
    }

    protected setElementDisplayed(element: DateCompWrapper, displayed: boolean): void {
        element.setDisplayed(displayed);
    }

    protected setElementDisabled(element: DateCompWrapper, disabled: boolean): void {
        element.setDisabled(disabled);
    }

    protected getDefaultFilterOptions(): string[] {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueElement(): HTMLElement {
        const eCondition = document.createElement('div');
        eCondition.classList.add('ag-filter-body');

        this.createFromToElement(eCondition, this.eConditionPanelsFrom, this.dateConditionFromComps, 'from');
        this.createFromToElement(eCondition, this.eConditionPanelsTo, this.dateConditionToComps, 'to');

        return eCondition;
    }

    private createFromToElement(eCondition: HTMLElement, eConditionPanels: HTMLElement[], dateConditionComps: DateCompWrapper[], fromTo: string): void {
        const eConditionPanel = document.createElement('div');
        eConditionPanel.classList.add(`ag-filter-${fromTo}`);
        eConditionPanel.classList.add(`ag-filter-date-${fromTo}`);
        eConditionPanels.push(eConditionPanel);
        eCondition.appendChild(eConditionPanel);
        dateConditionComps.push(this.createDateCompWrapper(eConditionPanel));
    }

    protected removeValueElements(startPosition: number, deleteCount?: number): void {
        this.removeDateComps(this.dateConditionFromComps, startPosition, deleteCount);
        this.removeDateComps(this.dateConditionToComps, startPosition, deleteCount);
        this.removeItems(this.eConditionPanelsFrom, startPosition, deleteCount);
        this.removeItems(this.eConditionPanelsTo, startPosition, deleteCount);
    }

    protected removeDateComps(components: DateCompWrapper[], startPosition: number, deleteCount?: number): void {
        const removedComponents = this.removeItems(components, startPosition, deleteCount);
        removedComponents.forEach(comp => comp.destroy());
    }

    protected isConditionUiComplete(position: number): boolean {
        if (!super.isConditionUiComplete(position)) {
            return false;
        }

        const isValidDate = (value: Date | null) => value != null
            && value.getUTCFullYear() >= this.minValidYear
            && value.getUTCFullYear() <= this.maxValidYear;

        let valid = true;
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (elPosition !== position || !valid || index >= numberOfInputs) {
                return;
            }
            valid = valid && isValidDate(element.getDate());
        });

        return valid;
    }

    protected areSimpleModelsEqual(aSimple: DateFilterModel, bSimple: DateFilterModel): boolean {
        return aSimple.dateFrom === bSimple.dateFrom
            && aSimple.dateTo === bSimple.dateTo
            && aSimple.type === bSimple.type;
        }

    protected getFilterType(): 'date' {
        return 'date';
    }

    protected createCondition(position: number): DateFilterModel {
        const type = this.getConditionType(position);
        const model: Partial<DateFilterModel> = {};

        const values = this.getValues(position);
        if (values.length > 0) {
            model.dateFrom = serialiseDate(values[0]);
        }
        if (values.length > 1) {
            model.dateTo = serialiseDate(values[1]);
        }

        return {
            dateFrom: null,
            dateTo: null,
            filterType: this.getFilterType(),
            type,
            ...model,
        };
    }

    protected resetPlaceholder(): void {
        const globalTranslate = this.localeService.getLocaleTextFunc();
        const placeholder = this.translate('dateFormatOoo');
        const ariaLabel = globalTranslate('ariaFilterValue', 'Filter Value');

        this.forEachInput((element) => {
            element.setInputPlaceholder(placeholder);
            element.setInputAriaLabel(ariaLabel);
        });
    }

    protected getInputs(position: number): Tuple<DateCompWrapper> {
        if (position >= this.dateConditionFromComps.length) {
            return [null, null];
        }
        return [this.dateConditionFromComps[position], this.dateConditionToComps[position]];
    }

    protected getValues(position: number): Tuple<Date> {
        const result: Tuple<Date> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(element.getDate());
            }
        });

        return result;
    }

    public getModelAsString(model: ISimpleFilterModel): string {
        return this.filterModelFormatter.getModelAsString(model) ?? '';
    }
}

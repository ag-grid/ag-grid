import { RefSelector } from '../../../widgets/componentAnnotations';
import { Autowired } from '../../../context/context';
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { DateCompWrapper } from './dateCompWrapper';
import { ConditionPosition, ISimpleFilterModel, Tuple } from '../simpleFilter';
import { Comparator, IScalarFilterParams, ScalarFilter } from '../scalarFilter';
import { serialiseDate, parseDateTimeFromString } from '../../../utils/date';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';

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

const DEFAULT_MIN_YEAR = 1000;
const DEFAULT_MAX_YEAR = Infinity;

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

    @RefSelector('eCondition1PanelFrom') private readonly eCondition1PanelFrom: HTMLElement;
    @RefSelector('eCondition1PanelTo') private readonly eCondition1PanelTo: HTMLElement;
    @RefSelector('eCondition2PanelFrom') private readonly eCondition2PanelFrom: HTMLElement;
    @RefSelector('eCondition2PanelTo') private readonly eCondition2PanelTo: HTMLElement;

    private dateCondition1FromComp: DateCompWrapper;
    private dateCondition1ToComp: DateCompWrapper;
    private dateCondition2FromComp: DateCompWrapper;
    private dateCondition2ToComp: DateCompWrapper;

    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private dateFilterParams: IDateFilterParams;
    private minValidYear: number = DEFAULT_MIN_YEAR;
    private maxValidYear: number = DEFAULT_MAX_YEAR;

    constructor() {
        super('dateFilter');
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        this.dateCondition1FromComp.afterGuiAttached(params);
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

    protected setParams(params: IDateFilterParams): void {
        super.setParams(params);

        this.dateFilterParams = params;

        const yearParser = (param: keyof IDateFilterParams, fallback: number) => {
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

        this.createDateComponents();
    }

    private createDateComponents(): void {
        const createDateCompWrapper = (element: HTMLElement) =>
            new DateCompWrapper(
                this.getContext(),
                this.userComponentFactory,
                {
                    onDateChanged: () => this.onUiChanged(),
                    filterParams: this.dateFilterParams
                },
                element);

        this.dateCondition1FromComp = createDateCompWrapper(this.eCondition1PanelFrom);
        this.dateCondition1ToComp = createDateCompWrapper(this.eCondition1PanelTo);
        this.dateCondition2FromComp = createDateCompWrapper(this.eCondition2PanelFrom);
        this.dateCondition2ToComp = createDateCompWrapper(this.eCondition2PanelTo);

        this.addDestroyFunc(() => {
            this.forEachInput((element) => element.destroy());
        });
    }

    protected setElementValue(element: DateCompWrapper, value: Date | null, silent?: boolean): void {
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

    protected createValueTemplate(position: ConditionPosition): string {
        const pos = position === ConditionPosition.One ? '1' : '2';

        return /* html */`
            <div class="ag-filter-body" ref="eCondition${pos}Body">
                <div class="ag-filter-from ag-filter-date-from" ref="eCondition${pos}PanelFrom"></div>
                <div class="ag-filter-to ag-filter-date-to" ref="eCondition${pos}PanelTo"></div>
            </div>`;
    }

    protected isConditionUiComplete(position: ConditionPosition): boolean {
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

    protected createCondition(position: ConditionPosition): DateFilterModel {
        const type = this.getConditionTypes()[position];
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
        const globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();
        const placeholder = this.translate('dateFormatOoo');
        const ariaLabel = globalTranslate('ariaFilterValue', 'Filter Value');

        this.forEachInput((element) => {
            element.setInputPlaceholder(placeholder);
            element.setInputAriaLabel(ariaLabel);
        });
    }

    protected getInputs(): Tuple<DateCompWrapper>[] {
        return [
            [this.dateCondition1FromComp, this.dateCondition1ToComp],
            [this.dateCondition2FromComp, this.dateCondition2ToComp],
        ];
    }

    protected getValues(position: ConditionPosition): Tuple<Date> {
        const result: Tuple<Date> = [];
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (position === elPosition && index < numberOfInputs) {
                result.push(element.getDate());
            }
        });

        return result;
    }
}

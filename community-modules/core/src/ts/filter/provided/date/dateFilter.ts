import { RefSelector } from '../../../widgets/componentAnnotations';
import { Autowired } from '../../../context/context';
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { DateCompWrapper } from './dateCompWrapper';
import { ConditionPosition, ISimpleFilterModel, SimpleFilter } from '../simpleFilter';
import { Comparator, IScalarFilterParams, ScalarFilter } from '../scalarFilter';
import { serialiseDate, parseDateTimeFromString } from '../../../utils/date';
import { setDisplayed } from '../../../utils/dom';
import { AgPromise } from '../../../utils';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';

// The date filter model takes strings, although the filter actually works with dates. This is because a Date object
// won't convert easily to JSON. When the model is used for doing the filtering, it's converted to a Date object.
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
    /** This is the minimum year that may be entered in a date field for the value to be considered valid. Default: `1000` */
    minValidYear?: number;
    /** This is the maximum year that may be entered in a date field for the value to be considered valid. Default is no restriction. */
    maxValidYear?: number;
}

export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight: Date, cellValue: any): number;
}

const DEFAULT_MIN_YEAR = 1000;
const DEFAULT_MAX_YEAR = Infinity;

export class DateFilter extends ScalarFilter<DateFilterModel, Date> {
    public static DEFAULT_FILTER_OPTIONS = [
        ScalarFilter.EQUALS,
        ScalarFilter.GREATER_THAN,
        ScalarFilter.LESS_THAN,
        ScalarFilter.NOT_EQUAL,
        ScalarFilter.IN_RANGE
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

    protected mapRangeFromModel(filterModel: DateFilterModel): { from: Date | null; to: Date | null; } {
        // unlike the other filters, we do two things here:
        // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
        //    are in different locations in Date and Number filter models)
        // 2) convert the type (because Date filter uses Dates, however model is 'string')
        //
        // NOTE: The conversion of string to date also removes the timezone - i.e. when user picks
        //       a date from the UI, it will have timezone info in it. This is lost when creating
        //       the model. When we recreate the date again here, it's without a timezone.
        return {
            from: parseDateTimeFromString(filterModel.dateFrom),
            to: parseDateTimeFromString(filterModel.dateTo)
        };
    }

    protected setValueFromFloatingFilter(value: string): void {
        this.dateCondition1FromComp.setDate(value == null ? null : parseDateTimeFromString(value));
        this.dateCondition1ToComp.setDate(null);
        this.dateCondition2FromComp.setDate(null);
        this.dateCondition2ToComp.setDate(null);
    }

    protected setConditionIntoUi(model: DateFilterModel, position: ConditionPosition): void {
        const [dateFrom, dateTo] = model ?
            [parseDateTimeFromString(model.dateFrom), parseDateTimeFromString(model.dateTo)] :
            [null, null];

        const [compFrom, compTo] = this.getFromToComponents(position);

        compFrom.setDate(dateFrom);
        compTo.setDate(dateTo);
    }

    protected resetUiToDefaults(silent?: boolean): AgPromise<void> {
        return super.resetUiToDefaults(silent).then(() => {
            this.dateCondition1FromComp.setDate(null);
            this.dateCondition1FromComp.setDisabled(this.isReadOnly());
            this.dateCondition1ToComp.setDate(null);
            this.dateCondition1ToComp.setDisabled(this.isReadOnly());
            this.dateCondition2FromComp.setDate(null);
            this.dateCondition2FromComp.setDisabled(this.isReadOnly());
            this.dateCondition2ToComp.setDate(null);
            this.dateCondition2ToComp.setDisabled(this.isReadOnly());
        });
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
            this.dateCondition1FromComp.destroy();
            this.dateCondition1ToComp.destroy();
            this.dateCondition2FromComp.destroy();
            this.dateCondition2ToComp.destroy();
        });
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
        const positionOne = position === ConditionPosition.One;
        const option = positionOne ? this.getCondition1Type() : this.getCondition2Type();

        if (option === SimpleFilter.EMPTY) { return false; }

        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }

        const [compFrom, compTo] = this.getFromToComponents(position);
        const isValidDate = (value: Date | null) => value != null
            && value.getUTCFullYear() >= this.minValidYear
            && value.getUTCFullYear() <= this.maxValidYear;

        return isValidDate(compFrom.getDate()) && (!this.showValueTo(option) || isValidDate(compTo.getDate()));
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
        const positionOne = position === ConditionPosition.One;
        const type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        const [compFrom, compTo] = this.getFromToComponents(position);

        return {
            dateFrom: serialiseDate(compFrom.getDate()),
            dateTo: serialiseDate(compTo.getDate()),
            type,
            filterType: this.getFilterType()
        };
    }

    private resetPlaceholder(): void {
        const globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();
        const placeholder = this.translate('dateFormatOoo');
        const ariaLabel = globalTranslate('ariaFilterValue', 'Filter Value');

        this.dateCondition1FromComp.setInputPlaceholder(placeholder);
        this.dateCondition1FromComp.setInputAriaLabel(ariaLabel);

        this.dateCondition1ToComp.setInputPlaceholder(placeholder);
        this.dateCondition1ToComp.setInputAriaLabel(ariaLabel);

        this.dateCondition2FromComp.setInputPlaceholder(placeholder);
        this.dateCondition2FromComp.setInputAriaLabel(ariaLabel);

        this.dateCondition2ToComp.setInputPlaceholder(placeholder);
        this.dateCondition2ToComp.setInputAriaLabel(ariaLabel);
    }

    protected updateUiVisibility(): void {
        super.updateUiVisibility();

        this.resetPlaceholder();

        const condition1Type = this.getCondition1Type();
        setDisplayed(this.eCondition1PanelFrom, this.showValueFrom(condition1Type));
        setDisplayed(this.eCondition1PanelTo, this.showValueTo(condition1Type));

        const condition2Type = this.getCondition2Type();
        setDisplayed(this.eCondition2PanelFrom, this.showValueFrom(condition2Type));
        setDisplayed(this.eCondition2PanelTo, this.showValueTo(condition2Type));
    }

    private getFromToComponents(position: ConditionPosition): [DateCompWrapper, DateCompWrapper] {
        return position === ConditionPosition.One ?
            [this.dateCondition1FromComp, this.dateCondition1ToComp] :
            [this.dateCondition2FromComp, this.dateCondition2ToComp];
    }
}

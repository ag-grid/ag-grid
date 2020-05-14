import { IDateParams } from '../../../rendering/dateComponent';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { Autowired } from '../../../context/context';
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { DateCompWrapper } from './dateCompWrapper';
import { ConditionPosition, ISimpleFilterModel, SimpleFilter } from '../simpleFilter';
import { Comparator, IScalarFilterParams, ScalarFilter } from '../scalarFilter';
import { serialiseDate, parseDateTimeFromString } from '../../../utils/date';
import { setDisplayed } from '../../../utils/dom';
import { Promise } from '../../../utils';

// The date filter model takes strings, although the filter actually works with dates. This is because a Date object
// won't convert easily to JSON. When the model is used for doing the filtering, it's converted to a Date object.
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

export class DateFilter extends ScalarFilter<DateFilterModel, Date> {
    private static readonly FILTER_TYPE = 'date';

    public static DEFAULT_FILTER_OPTIONS = [
        ScalarFilter.EQUALS,
        ScalarFilter.GREATER_THAN,
        ScalarFilter.LESS_THAN,
        ScalarFilter.NOT_EQUAL,
        ScalarFilter.IN_RANGE
    ];

    @RefSelector('eCondition1PanelFrom') private eCondition1PanelFrom: HTMLElement;
    @RefSelector('eCondition1PanelTo') private eCondition1PanelTo: HTMLElement;
    @RefSelector('eCondition2PanelFrom') private eCondition2PanelFrom: HTMLElement;
    @RefSelector('eCondition2PanelTo') private eCondition2PanelTo: HTMLElement;

    private dateCondition1FromComp: DateCompWrapper;
    private dateCondition1ToComp: DateCompWrapper;
    private dateCondition2FromComp: DateCompWrapper;
    private dateCondition2ToComp: DateCompWrapper;

    @Autowired('userComponentFactory')
    private userComponentFactory: UserComponentFactory;

    private dateFilterParams: IDateFilterParams;

    protected mapRangeFromModel(filterModel: DateFilterModel): { from: Date; to: Date; } {
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
        if (value != null) {
            const dateFrom = parseDateTimeFromString(value);
            this.dateCondition1FromComp.setDate(dateFrom);
        } else {
            this.dateCondition1FromComp.setDate(null);
        }

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

    protected resetUiToDefaults(silent?: boolean): Promise<void> {
        return super.resetUiToDefaults(silent).then(() => {
            this.dateCondition1FromComp.setDate(null);
            this.dateCondition1ToComp.setDate(null);
            this.dateCondition2FromComp.setDate(null);
            this.dateCondition2ToComp.setDate(null);
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

        this.createDateComponents();
    }

    private createDateComponents(): void {
        // params to pass to all four date comps
        const dateComponentParams: IDateParams = {
            onDateChanged: () => this.onUiChanged(),
            filterParams: this.dateFilterParams
        };

        this.dateCondition1FromComp = new DateCompWrapper(this.getContext(), this.userComponentFactory, dateComponentParams, this.eCondition1PanelFrom);
        this.dateCondition1ToComp = new DateCompWrapper(this.getContext(), this.userComponentFactory, dateComponentParams, this.eCondition1PanelTo);
        this.dateCondition2FromComp = new DateCompWrapper(this.getContext(), this.userComponentFactory, dateComponentParams, this.eCondition2PanelFrom);
        this.dateCondition2ToComp = new DateCompWrapper(this.getContext(), this.userComponentFactory, dateComponentParams, this.eCondition2PanelTo);

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
                <div class="ag-filter-from ag-filter-date-from" ref="eCondition${pos}PanelFrom">
                </div>
                <div class="ag-filter-to ag-filter-date-to" ref="eCondition${pos}PanelTo">
                </div>
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

        return compFrom.getDate() != null && (option !== SimpleFilter.IN_RANGE || compTo.getDate() != null);
    }

    protected areSimpleModelsEqual(aSimple: DateFilterModel, bSimple: DateFilterModel): boolean {
        return aSimple.dateFrom === bSimple.dateFrom
            && aSimple.dateTo === bSimple.dateTo
            && aSimple.type === bSimple.type;
    }

    // needed for creating filter model
    protected getFilterType(): string {
        return DateFilter.FILTER_TYPE;
    }

    protected createCondition(position: ConditionPosition): DateFilterModel {
        const positionOne = position === ConditionPosition.One;
        const type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        const [compFrom, compTo] = this.getFromToComponents(position);

        return {
            dateFrom: serialiseDate(compFrom.getDate()),
            dateTo: serialiseDate(compTo.getDate()),
            type,
            filterType: DateFilter.FILTER_TYPE
        };
    }

    private resetPlaceholder(): void {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const placeholder = translate('dateFormatOoo', 'yyyy-mm-dd');

        this.dateCondition1FromComp.setInputPlaceholder(placeholder);
        this.dateCondition1ToComp.setInputPlaceholder(placeholder);
        this.dateCondition2FromComp.setInputPlaceholder(placeholder);
        this.dateCondition2ToComp.setInputPlaceholder(placeholder);
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

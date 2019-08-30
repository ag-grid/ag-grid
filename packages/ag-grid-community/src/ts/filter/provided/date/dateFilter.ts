import { IDateParams } from "../../../rendering/dateComponent";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { Autowired } from "../../../context/context";
import { UserComponentFactory } from "../../../components/framework/userComponentFactory";
import { _ } from "../../../utils";
import { DateCompWrapper } from "./dateCompWrapper";
import { ConditionPosition, ISimpleFilterModel, SimpleFilter } from "../simpleFilter";
import { IDateComparatorFunc } from "./dateFilter";
import { Comparator, IScalarFilterParams, ScalerFilter } from "../scalerFilter";

// the date filter model is a bit different, it takes strings, although the
// filter actually works with dates. this is because a Date object won't convert
// easily to JSON. so when the model is used for doing the filtering, it's converted
// to Date objects.
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

export class DateFilter extends ScalerFilter<DateFilterModel, Date> {

    private static readonly FILTER_TYPE = 'date';

    public static DEFAULT_FILTER_OPTIONS = [ScalerFilter.EQUALS, ScalerFilter.GREATER_THAN,
        ScalerFilter.LESS_THAN, ScalerFilter.NOT_EQUAL, ScalerFilter.IN_RANGE];

    @RefSelector('ePanelFrom1')
    private ePanelFrom1: HTMLElement;
    @RefSelector('ePanelFrom2')
    private ePanelFrom2: HTMLElement;

    @RefSelector('ePanelTo1')
    private ePanelTo1: HTMLElement;
    @RefSelector('ePanelTo2')
    private ePanelTo2: HTMLElement;

    private dateCompFrom1: DateCompWrapper;
    private dateCompFrom2: DateCompWrapper;
    private dateCompTo1: DateCompWrapper;
    private dateCompTo2: DateCompWrapper;

    @Autowired('userComponentFactory')
    private userComponentFactory: UserComponentFactory;

    private dateFilterParams: IDateFilterParams;

    protected mapRangeFromModel(filterModel: DateFilterModel): {from: Date, to: Date} {
        // unlike the other filters, we do two things here:
        // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
        //    are in different locations in Date and Number filter models)
        // 2) convert the type (cos Date filter uses Dates, however model is 'string')
        //
        // NOTE: The conversion of string to date also removes the timezone - ie when user picks
        //       a date form the UI, it will have timezone info in it. This is lost when creating
        //       the model. Then when we recreate the date again here, it's without timezone.
        return {
            from: _.parseYyyyMmDdToDate(filterModel.dateFrom, "-"),
            to: _.parseYyyyMmDdToDate(filterModel.dateTo, "-")
        };
    }

    protected setValueFromFloatingFilter(value: string): void {
        if (value != null) {
            const dateFrom = _.parseYyyyMmDdToDate(value, "-");
            this.dateCompFrom1.setDate(dateFrom);
        } else {
            this.dateCompFrom1.setDate(null);
        }

        this.dateCompTo1.setDate(null);
        this.dateCompFrom2.setDate(null);
        this.dateCompTo2.setDate(null);
    }

    protected setConditionIntoUi(model: DateFilterModel, position: ConditionPosition): void {
        const positionOne = position === ConditionPosition.One;

        const dateFromString = model ? model.dateFrom : null;
        const dateToString = model ? model.dateTo : null;

        const dateFrom = _.parseYyyyMmDdToDate(dateFromString, "-");
        const dateTo = _.parseYyyyMmDdToDate(dateToString, "-");

        const compFrom = positionOne ? this.dateCompFrom1 : this.dateCompFrom2;
        const compTo = positionOne ? this.dateCompTo1 : this.dateCompTo2;

        compFrom.setDate(dateFrom);
        compTo.setDate(dateTo);
    }

    protected resetUiToDefaults(): void {
        super.resetUiToDefaults();

        this.dateCompTo1.setDate(null);
        this.dateCompTo2.setDate(null);
        this.dateCompFrom1.setDate(null);
        this.dateCompFrom2.setDate(null);
    }

    protected comparator(): Comparator<Date> {
        return this.dateFilterParams.comparator ? this.dateFilterParams.comparator : this.defaultComparator.bind(this);
    }

    private defaultComparator(filterDate: Date, cellValue: any): number {
        //The default comparator assumes that the cellValue is a date
        const cellAsDate = cellValue as Date;
        if  (cellAsDate < filterDate) { return -1; }
        if  (cellAsDate > filterDate) { return 1; }
        return cellValue != null ? 0 : -1;
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

        this.dateCompFrom1 = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelFrom1);
        this.dateCompFrom2 = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelFrom2);
        this.dateCompTo1 = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelTo1);
        this.dateCompTo2 = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelTo2);

        this.addDestroyFunc(() => {
            this.dateCompFrom1.destroy();
            this.dateCompFrom2.destroy();
            this.dateCompTo1.destroy();
            this.dateCompTo2.destroy();
        });
    }

    protected getDefaultFilterOptions(): string[] {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueTemplate(position: ConditionPosition): string {

        const positionOne = position === ConditionPosition.One;

        const pos = positionOne ? '1' : '2';

        return `<div class="ag-filter-body" ref="eCondition${pos}Body">
                    <div class="ag-filter-date-from" ref="ePanelFrom${pos}">
                    </div>
                    <div class="ag-filter-date-to" ref="ePanelTo${pos}"">
                    </div>
                </div>`;
    }

    protected isConditionUiComplete(position: ConditionPosition): boolean {
        const positionOne = position === ConditionPosition.One;

        const option = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        const compFrom = positionOne ? this.dateCompFrom1 : this.dateCompFrom2;
        const compTo = positionOne ? this.dateCompTo1 : this.dateCompTo2;

        const valueFrom = compFrom.getDate();
        const valueTo = compTo.getDate();

        if (option === SimpleFilter.EMPTY) { return false; }

        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }

        if (option === SimpleFilter.IN_RANGE) {
            return valueFrom != null && valueTo != null;
        } else {
            return valueFrom != null;
        }
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

        const dateCompTo = positionOne ? this.dateCompTo1 : this.dateCompTo2;
        const dateCompFrom = positionOne ? this.dateCompFrom1 : this.dateCompFrom2;

        return {
            dateTo: _.serializeDateToYyyyMmDd(dateCompTo.getDate(), "-"),
            dateFrom: _.serializeDateToYyyyMmDd(dateCompFrom.getDate(), "-"),
            type: type,
            filterType: DateFilter.FILTER_TYPE
        };
    }

    protected updateUiVisibility(): void {

        super.updateUiVisibility();

        const showFrom1 = this.showValueFrom(this.getCondition1Type());
        _.setDisplayed(this.ePanelFrom1, showFrom1);

        const showTo1 = this.showValueTo(this.getCondition1Type());
        _.setDisplayed(this.ePanelTo1, showTo1);

        const showFrom2 = this.showValueFrom(this.getCondition2Type());
        _.setDisplayed(this.ePanelFrom2, showFrom2);

        const showTo2 = this.showValueTo(this.getCondition2Type());
        _.setDisplayed(this.ePanelTo2, showTo2);

    }

}
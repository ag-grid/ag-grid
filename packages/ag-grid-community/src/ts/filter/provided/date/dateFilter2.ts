import {
    AbstractSimpleFilter,
    FilterPosition,
    IAbstractSimpleFilterParams,
    IAbstractSimpleModel
} from "../abstractSimpleFilter";
import {FilterModel} from "../../../interfaces/iFilter";
import {RefSelector} from "../../../widgets/componentAnnotations";
import {AbstractComparableFilter} from "../abstractComparableFilter";
import {_} from "../../../utils";
import {AbstractScalerFilter2} from "../abstractScalerFilter2";
import {Comparator} from "../abstractFilter";
import {IDateComp, IDateParams} from "../../../rendering/dateComponent";
import {Autowired} from "../../../context/context";
import {UserComponentFactory} from "../../../components/framework/userComponentFactory";
import {IDateComparatorFunc} from "./dateFilter";

// the date filter model is a bit different, it takes strings, although the
// filter actually works with dates. this is because a Date object won't convert
// easily to JSON. so when the model is used for doing the filtering, it's converted
// to Date objects.
export interface DateFilter2Model extends IAbstractSimpleModel {
    dateFrom: string;
    dateTo: string;
}

export interface IDateFilterParams2 extends IAbstractSimpleFilterParams {
    comparator?: IDateComparatorFunc;
    browserDatePicker?: boolean;
}

// removes the complexity of async component creation from the date panel. while the component does not
// exist, the wrapper keeps the value that was set and returns this value when queried. when the component
// is finally created, it gets the temp value if set.
class DateCompWrapper {

    private dateComp: IDateComp;

    private tempValue: Date;

    private alive = true;

    constructor(userComponentFactory: UserComponentFactory, dateComponentParams: IDateParams, eParent: HTMLElement) {

        userComponentFactory.newDateComponent(dateComponentParams).then (dateComp => {

            // because async, check the filter still exists after component comes back
            if (!this.alive) {
                if (dateComp.destroy) {
                    dateComp.destroy();
                }
                return;
            }

            this.dateComp = dateComp;
            eParent.appendChild(dateComp.getGui());

            if (dateComp.afterGuiAttached) {
                dateComp.afterGuiAttached();
            }

            if (this.tempValue) {
                dateComp.setDate(this.tempValue);
            }
        });

    }

    public destroy(): void {
        this.alive = false;
        if (this.dateComp && this.dateComp.destroy) {
            this.dateComp.destroy();
        }
    }

    public getDate(): Date {
        if (this.dateComp) {
            return this.dateComp.getDate();
        } else {
            return this.tempValue;
        }
    }

    public setDate(value: Date): void {
        if (this.dateComp) {
            this.dateComp.setDate(value);
        } else {
            this.tempValue = value;
        }
    }

}

export class DateFilter2 extends AbstractScalerFilter2<DateFilter2Model, Date> {

    private static readonly FILTER_TYPE = 'date';

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

    private dateFilterParams: IDateFilterParams2;

    protected mapRangeFromModel(filterModel: DateFilter2Model): {from: Date, to: Date} {
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

    protected setConditionIntoUi(model: DateFilter2Model, position: FilterPosition): void {
        const positionOne = position===FilterPosition.One;

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

    protected setParams(params: IDateFilterParams2): void {
        super.setParams(params);

        this.dateFilterParams = params;

        this.createDateComponents();
    }

    private createDateComponents(): void {

        // params to pass to all four date comps
        const dateComponentParams: IDateParams = {
            onDateChanged: this.onUiChangedListener.bind(this),
            filterParams: this.dateFilterParams
        };

        this.dateCompFrom1 = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelFrom1);
        this.dateCompFrom2 = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelFrom2);
        this.dateCompTo1 = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelTo1);
        this.dateCompTo2 = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.ePanelTo2);

        this.addDestroyFunc( () => {
            this.dateCompFrom1.destroy();
            this.dateCompFrom2.destroy();
            this.dateCompTo1.destroy();
            this.dateCompTo2.destroy();
        });
    }

    protected modelFromFloatingFilter(from: string): FilterModel {
        return null;
    }

    protected getDefaultFilterOptions(): string[] {
        return [AbstractComparableFilter.EQUALS, AbstractComparableFilter.GREATER_THAN,
            AbstractComparableFilter.LESS_THAN, AbstractComparableFilter.NOT_EQUAL, AbstractComparableFilter.IN_RANGE];
    }

    protected createValueTemplate(position: FilterPosition): string {

        const positionOne = position===FilterPosition.One;

        const pos = positionOne ? '1' : '2';

        return `<div class="ag-filter-body" ref="eCondition${pos}Body">
                    <div class="ag-filter-date-from" ref="ePanelFrom${pos}">
                    </div>
                    <div class="ag-filter-date-to" ref="ePanelTo${pos}"">
                    </div>
                </div>`;
    }

    protected isFilterUiComplete(position: FilterPosition): boolean {
        const positionOne = position===FilterPosition.One;

        const option = positionOne ? this.getType1() : this.getType2();
        const compFrom = positionOne ? this.dateCompFrom1 : this.dateCompFrom2;
        const compTo = positionOne ? this.dateCompTo1 : this.dateCompTo2;

        const valueFrom = compFrom.getDate();
        const valueTo = compTo.getDate();

        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }

        if (option===AbstractSimpleFilter.IN_RANGE) {
            return valueFrom != null && valueTo != null;
        } else {
            return valueFrom != null;
        }
    }

    protected areSimpleModelsEqual(aSimple: DateFilter2Model, bSimple: DateFilter2Model): boolean {
        return aSimple.dateFrom === bSimple.dateFrom
            && aSimple.dateTo === bSimple.dateTo
            && aSimple.type === bSimple.type;
    }

    // needed for creating filter model
    protected getFilterType(): string {
        return DateFilter2.FILTER_TYPE;
    }

    protected createCondition(position: FilterPosition): DateFilter2Model {

        const positionOne = position===FilterPosition.One;

        const type = positionOne ? this.getType1() : this.getType2();

        const dateCompTo = positionOne ? this.dateCompTo1 : this.dateCompTo2;
        const dateCompFrom = positionOne ? this.dateCompFrom1 : this.dateCompFrom2;

        return {
            dateTo: _.serializeDateToYyyyMmDd(dateCompTo.getDate(), "-"),
            dateFrom: _.serializeDateToYyyyMmDd(dateCompFrom.getDate(), "-"),
            type: type,
            filterType: DateFilter2.FILTER_TYPE
        };
    }

    protected updateUiVisibility(): void {

        super.updateUiVisibility();

        const show = (type: string, eValue: HTMLElement, eValueTo: HTMLElement) => {
            const showValue = !this.doesFilterHaveHiddenInput(type) && type !== AbstractSimpleFilter.EMPTY;
            _.setVisible(eValue, showValue);
            const showValueTo = type === AbstractSimpleFilter.IN_RANGE;
            _.setVisible(eValueTo, showValueTo);
        };

        show(this.getType1(), this.ePanelFrom1, this.ePanelTo1);
        show(this.getType2(), this.ePanelFrom2, this.ePanelTo2);

    }


}
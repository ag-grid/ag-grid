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

export interface DateFilter2Model extends IAbstractSimpleModel {
    dateFrom: string;
    dateTo: string;
}

export interface IDateFilterParams2 extends IAbstractSimpleFilterParams {
    comparator?: IDateComparatorFunc;
    browserDatePicker?: boolean;
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

    private dateCompFrom1: IDateComp;
    private dateCompFrom2: IDateComp;
    private dateCompTo1: IDateComp;
    private dateCompTo2: IDateComp;

    @Autowired('userComponentFactory')
    private userComponentFactory: UserComponentFactory;

    private dateFilterParams: IDateFilterParams2;

    protected mapRangeFromModel(filterModel: DateFilter2Model): {from: Date, to: Date} {
        return {
            from: _.parseYyyyMmDdToDate(filterModel.dateFrom, "-"),
            to: _.parseYyyyMmDdToDate(filterModel.dateTo, "-")
        };
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

        // 4 date comps created in identical way - this method holds common creation logic
        const createComp = (callback: (comp: IDateComp)=>void): void => {

            this.userComponentFactory.newDateComponent(dateComponentParams).then (dateComp => {

                // because async, check the filter still exists after component comes back
                if (!this.isAlive()) {
                    if (dateComp.destroy) {
                        dateComp.destroy();
                    }
                    return;
                }

                callback(dateComp);

                if (dateComp.afterGuiAttached) {
                    dateComp.afterGuiAttached();
                }

                this.addDestroyFunc( ()=> {
                    if (dateComp.destroy) {
                        dateComp.destroy();
                    }
                });
            });
        };

        // only thing that differs is where we put the comp
        createComp( dateComp => {
            this.dateCompFrom1 = dateComp;
            this.ePanelFrom1.appendChild(dateComp.getGui());
        });
        createComp( dateComp => {
            this.dateCompFrom2 = dateComp;
            this.ePanelFrom2.appendChild(dateComp.getGui());
        });
        createComp( dateComp => {
            this.dateCompTo1 = dateComp;
            this.ePanelTo1.appendChild(dateComp.getGui());
        });
        createComp( dateComp => {
            this.dateCompTo2 = dateComp;
            this.ePanelTo2.appendChild(dateComp.getGui());
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
import {IFilterParams, SerializedFilter} from "../interfaces/iFilter";
import {Component} from "../widgets/component";
import {IDateComp, IDateParams} from "../rendering/dateComponent";
import {QuerySelector} from "../widgets/componentAnnotations";
import {Utils} from "../utils";
import {BaseFilter, Comparator, FilterConditionType, IComparableFilterParams, ScalarBaseFilter} from "./baseFilter";
import {Autowired} from "../context/context";
import {ComponentRecipes} from "../components/framework/componentRecipes";

export interface IDateFilterParams extends IComparableFilterParams {
    comparator?: IDateComparatorFunc;
    browserDatePicker?: boolean;
}

export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight: Date, cellValue: any): number;
}

export interface SerializedDateFilter extends SerializedFilter {
    dateFrom: string;
    dateTo: string;
    type: string;
}

export class DateFilter extends ScalarBaseFilter<Date, IDateFilterParams, SerializedDateFilter> {
    private dateToComponent: IDateComp;
    private dateFromComponent: IDateComp;

    private dateToConditionComponent: IDateComp;
    private dateFromConditionComponent: IDateComp;

    @Autowired('componentRecipes')
    private componentRecipes: ComponentRecipes;

    @QuerySelector('#filterDateFromPanel')
    private eDateFromPanel: HTMLElement;

    @QuerySelector('#filterDateFromConditionPanel')
    private eDateFromConditionPanel: HTMLElement;

    @QuerySelector('#filterDateToPanel')
    private eDateToPanel: HTMLElement;

    @QuerySelector('#filterDateToConditionPanel')
    private eDateToConditionPanel: HTMLElement;

    private dateFrom: Date;

    private dateTo: Date;

    public modelFromFloatingFilter(from: string): SerializedDateFilter {
        return {
            dateFrom: from,
            dateTo: this.getDateTo(),
            type: this.filter,
            filterType: 'date'
        };
    }

    public getApplicableFilterTypes(): string[] {
        return [BaseFilter.EQUALS, BaseFilter.GREATER_THAN, BaseFilter.LESS_THAN, BaseFilter.NOT_EQUAL, BaseFilter.IN_RANGE];
    }

    public bodyTemplate(type:FilterConditionType): string {
        let fromPanelId = type == FilterConditionType.MAIN ? "filterDateFromPanel" : "filterDateFromConditionPanel";
        let toPanelId = type == FilterConditionType.MAIN ? "filterDateToPanel" : "filterDateToConditionPanel";

        return `<div class="ag-filter-body">
                    <div class="ag-filter-date-from" id="${fromPanelId}">
                    </div>
                    <div class="ag-filter-date-to" id="${toPanelId}">
                    </div>
                </div>`;
    }

    public initialiseFilterBodyUi(type:FilterConditionType): void {
        super.initialiseFilterBodyUi(type);
        this.createComponents(type);
    }

    private createComponents (type:FilterConditionType){
        let dateComponentParams: IDateParams = {
            onDateChanged: ()=>{this.onDateChanged (type)},
            filterParams: this.filterParams
        };

        this.componentRecipes.newDateComponent(dateComponentParams).then (dateToComponent=> {
            if (type === FilterConditionType.MAIN){
                this.dateToComponent = dateToComponent;
            } else{
                this.dateToConditionComponent = dateToComponent;
            }

            let dateToElement = dateToComponent.getGui();

            if (type === FilterConditionType.MAIN){
                this.eDateToPanel.appendChild(dateToElement);
                if (this.dateToComponent.afterGuiAttached) {
                    this.dateToComponent.afterGuiAttached();
                }
            } else {
                this.eDateToConditionPanel.appendChild(dateToElement);
                if (this.dateToConditionComponent.afterGuiAttached) {
                    this.dateToConditionComponent.afterGuiAttached();
                }
            }
        });
        this.componentRecipes.newDateComponent(dateComponentParams).then(dateFromComponent => {
            if (type === FilterConditionType.MAIN) {
                this.dateFromComponent = dateFromComponent;
            } else {
                this.dateFromConditionComponent = dateFromComponent;
            }

            let dateFromElement = dateFromComponent.getGui();

            if (type === FilterConditionType.MAIN) {
                this.eDateFromPanel.appendChild(dateFromElement);
                if (this.dateFromComponent.afterGuiAttached) {
                    this.dateFromComponent.afterGuiAttached();
                }
            } else {
                this.eDateFromConditionPanel.appendChild(dateFromElement);
                if (this.dateFromConditionComponent.afterGuiAttached) {
                    this.dateFromConditionComponent.afterGuiAttached();
                }
            }
        });
    }

    private onDateChanged(type:FilterConditionType): void {
        this.dateFrom = DateFilter.removeTimezone(this.dateFromComponent.getDate());
        this.dateTo = DateFilter.removeTimezone(this.dateToComponent.getDate());
        this.onFilterChanged();
    }

    public refreshFilterBodyUi(): void {
        let visible = this.filter === BaseFilter.IN_RANGE;
        Utils.setVisible(this.eDateToPanel, visible);

        if (this.dateFromConditionComponent) {
            let visible = this.filterCondition === BaseFilter.IN_RANGE;
            Utils.setVisible(this.eDateToConditionPanel, visible);
        }
    }

    public comparator(): Comparator<Date> {
        return this.filterParams.comparator ? this.filterParams.comparator : this.defaultComparator.bind(this);
    }

    private defaultComparator(filterDate: Date, cellValue: any): number {
        //The default comparator assumes that the cellValue is a date
        let cellAsDate = <Date> cellValue;
        if  (cellAsDate < filterDate) { return -1; }
        if  (cellAsDate > filterDate) { return 1; }
        return cellValue != null ? 0 : -1;
    }

    public serialize(type:FilterConditionType): SerializedDateFilter {
        let dateToComponent = type === FilterConditionType.MAIN ? this.dateToComponent : this.dateToConditionComponent;
        let dateFromComponent = type === FilterConditionType.MAIN ? this.dateFromComponent : this.dateFromConditionComponent;
        let filterType = type === FilterConditionType.MAIN ? this.filter : this.filterCondition;
        return {
            dateTo: Utils.serializeDateToYyyyMmDd(dateToComponent.getDate(), "-"),
            dateFrom: Utils.serializeDateToYyyyMmDd(dateFromComponent.getDate(), "-"),
            type: filterType ? filterType : this.defaultFilter,
            filterType: 'date'
        };
    }

    public filterValues(type:FilterConditionType): Date|Date[] {
        if (type === FilterConditionType.MAIN){
            if (!this.dateFromComponent) return null;

            return this.filter !== BaseFilter.IN_RANGE ?
                this.dateFromComponent.getDate() :
                [this.dateFromComponent.getDate(), this.dateToComponent.getDate()];
        }

        if (!this.dateFromConditionComponent) return null;

        return this.filterCondition !== BaseFilter.IN_RANGE ?
            this.dateFromConditionComponent.getDate() :
            [this.dateFromConditionComponent.getDate(), this.dateToConditionComponent.getDate()];
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getDateFrom(): string {
        return Utils.serializeDateToYyyyMmDd(this.dateFromComponent.getDate(), "-");
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getDateTo(): string {
        return Utils.serializeDateToYyyyMmDd(this.dateToComponent.getDate(), "-");
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getFilterType(): string {
        return this.filter;
    }

    public setDateFrom(date: string): void {
        this.dateFrom = Utils.parseYyyyMmDdToDate(date, "-");
        this.dateFromComponent.setDate(this.dateFrom);
    }

    public setDateTo(date: string): void {
        this.dateTo = Utils.parseYyyyMmDdToDate(date, "-");
        this.dateToComponent.setDate(this.dateTo);
    }

    public resetState(): void {
        this.setDateFrom(null);
        this.setDateTo(null);
        this.setFilterType(this.defaultFilter, FilterConditionType.MAIN);
    }

    public parse(model: SerializedDateFilter): void {
        this.setDateFrom(model.dateFrom);
        this.setDateTo(model.dateTo);
        this.setFilterType(model.type, FilterConditionType.MAIN);
    }

    public setType(filterType: string, type:FilterConditionType): void {
        this.setFilterType(filterType, type);
    }

    public static removeTimezone(from: Date): Date {
        if (!from) { return null; }
        return new Date (from.getFullYear(), from.getMonth(), from.getDate());
    }
}

export class DefaultDateComponent extends Component implements IDateComp {

    private eDateInput: HTMLInputElement;
    private listener: ()=>void;

    constructor() {
        super(`<input class="ag-filter-filter" type="text" placeholder="yyyy-mm-dd">`);
    }

    public init(params: IDateParams): void {
        this.eDateInput = <HTMLInputElement> this.getGui();

        if (Utils.isBrowserChrome() || params.filterParams.browserDatePicker) {
            if (Utils.isBrowserIE()){
                console.warn('ag-grid: browserDatePicker is specified to true, but it is not supported in IE 11, reverting to plain text date picker')
            }else{
                this.eDateInput.type = 'date';
            }
        }

        this.listener = params.onDateChanged;

        this.addGuiEventListener('input', this.listener);
    }

    public getDate(): Date {
        return Utils.parseYyyyMmDdToDate(this.eDateInput.value, "-");
    }

    public setDate(date: Date): void {
        this.eDateInput.value = Utils.serializeDateToYyyyMmDd(date, "-");
    }

}
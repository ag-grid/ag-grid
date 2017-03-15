import {IFilterParams, SerializedFilter} from "../interfaces/iFilter";
import {Component} from "../widgets/component";
import {IDateParams, IDateComp} from "../rendering/dateComponent";
import {QuerySelector} from "../widgets/componentAnnotations";
import {Utils} from "../utils";
import {BaseFilter, Comparator, ScalarBaseFilter} from "./baseFilter";
import {Autowired} from "../context/context";
import {ComponentProvider} from "../componentProvider";

export interface IDateFilterParams extends IFilterParams {
    comparator?: IDateComparatorFunc;
}

export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight:Date, cellValue: any): number;
}

export interface SerializedDateFilter extends SerializedFilter {
    dateFrom:string;
    dateTo:string;
    type:string;
}

export class DateFilter extends ScalarBaseFilter<Date, IDateFilterParams, SerializedDateFilter> {
    private dateToComponent:IDateComp;
    private dateFromComponent:IDateComp;

    @Autowired('componentProvider')
    private componentProvider:ComponentProvider;

    @QuerySelector('#filterDateFromPanel')
    private eDateFromPanel: HTMLElement;

    @QuerySelector('#filterDateToPanel')
    private eDateToPanel: HTMLElement;

    private dateFrom:Date;

    private dateTo:Date;

    public modelFromFloatingFilter(from: string): SerializedDateFilter {
        return {
            dateFrom: from,
            dateTo: this.getDateTo(),
            type: this.filter,
            filterType: 'date'
        };
    }

    public getApplicableFilterTypes ():string[]{
        return [BaseFilter.EQUALS, BaseFilter.GREATER_THAN, BaseFilter.LESS_THAN, BaseFilter.NOT_EQUAL, BaseFilter.IN_RANGE];
    }


    public bodyTemplate(): string {
        return `<div class="ag-filter-body">
                    <div class="ag-filter-date-from" id="filterDateFromPanel">
                    </div>
                    <div class="ag-filter-date-to" id="filterDateToPanel">
                    </div>
                </div>`;
    }

    public initialiseFilterBodyUi(): void {
        let dateComponentParams: IDateParams = {
            onDateChanged: this.onDateChanged.bind(this)
        };

        this.dateToComponent = this.componentProvider.newDateComponent(dateComponentParams);
        this.dateFromComponent = this.componentProvider.newDateComponent(dateComponentParams);


        this.eDateFromPanel.appendChild(this.dateFromComponent.getGui());
        this.eDateToPanel.appendChild(this.dateToComponent.getGui());


        if (this.dateFromComponent.afterGuiAttached) {
            this.dateFromComponent.afterGuiAttached();
        }

        if (this.dateToComponent.afterGuiAttached) {
            this.dateToComponent.afterGuiAttached();
        }
    }

    private onDateChanged(): void {
        this.dateFrom = DateFilter.removeTimezone(this.dateFromComponent.getDate());
        this.dateTo = DateFilter.removeTimezone(this.dateToComponent.getDate());
        this.onFilterChanged();
    }

    public refreshFilterBodyUi(): void {
        let visible = this.filter === BaseFilter.IN_RANGE;
        Utils.setVisible(this.eDateToPanel, visible);
    }

    public comparator(): Comparator<Date> {
        return this.filterParams.comparator ? this.filterParams.comparator : this.defaultComparator.bind(this);
    }

    private defaultComparator (filterDate:Date, cellValue:any):number {
        //The default comparator assumes that the cellValue is a date
        let cellAsDate = <Date> cellValue;
        if  (cellAsDate < filterDate) { return -1 }
        if  (cellAsDate > filterDate) { return 1 }
        return 0;
    }

    public serialize(): SerializedDateFilter {
        return {
            dateTo: Utils.serializeDateToYyyyMmDd(this.dateToComponent.getDate(), "-"),
            dateFrom: Utils.serializeDateToYyyyMmDd(this.dateFromComponent.getDate(), "-"),
            type: this.filter,
            filterType: 'date'
        }
    }

    public filterValues ():Date|Date[] {
        return this.filter !== BaseFilter.IN_RANGE ?
            this.dateFromComponent.getDate() :
            [this.dateFromComponent.getDate(), this.dateToComponent.getDate()];
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getDateFrom ():string{
        return Utils.serializeDateToYyyyMmDd(this.dateFromComponent.getDate(), "-");
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getDateTo ():string{
        return Utils.serializeDateToYyyyMmDd(this.dateToComponent.getDate(), "-");
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getFilterType ():string{
        return this.filter;
    }

    public setDateFrom (date:string):void{
        this.dateFrom = Utils.parseYyyyMmDdToDate(date, "-");
        this.dateFromComponent.setDate(this.dateFrom);
    }

    public setDateTo (date:string):void{
        this.dateTo = Utils.parseYyyyMmDdToDate(date, "-");
        this.dateToComponent.setDate(this.dateTo)
    }

    public resetState():void{
        this.setDateFrom(null);
        this.setDateTo(null);
        this.setFilterType("equals");
    }

    public parse(model: SerializedDateFilter): void {
        this.setDateFrom(model.dateFrom);
        this.setDateTo(model.dateTo);
        this.setFilterType(model.type);
    }

    public setType (filterType:string):void{
        this.setFilterType(filterType);
    }

    public static removeTimezone (from:Date):Date{
        if (!from) return null;
        return new Date (from.getFullYear(), from.getMonth(), from.getDate());
    }
}

export class DefaultDateComponent extends Component implements IDateComp {

    private eDateInput: HTMLInputElement;
    private listener:()=>void;

    constructor() {
        super(`<input class="ag-filter-filter" type="text" placeholder="yyyy-mm-dd">`);
    }

    public init (params: IDateParams):void{
        this.eDateInput = <HTMLInputElement> this.getGui();

        if (Utils.isBrowserChrome()){
            this.eDateInput.type = 'date';
        }

        this.listener = params.onDateChanged;

        this.addGuiEventListener('input', this.listener);
    }

    public getDate():Date {
        return Utils.parseYyyyMmDdToDate(this.eDateInput.value, "-");
    }

    public setDate(date: Date): void {
        this.eDateInput.value = Utils.serializeDateToYyyyMmDd(date, "-");
    }

}
import {IFilter, IFilterParams, IDoesFilterPassParams} from "../interfaces/iFilter";
import {Component} from "../widgets/component";
import {QuerySelector} from "../widgets/componentAnnotations";
import {Autowired, Context} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export interface IDateFilterParams extends IFilterParams{
    comparator: (filterLocalDateAtMidnight:Date, cellValue:any)=>number;
}

export interface SerializedDateFilter {
    dateFrom:string
    dateTo:string
    filterType:string
}

export class DateFilter extends Component implements IFilter {
    public static EQUALS = 'equals';// 1;
    public static NOT_EQUAL = 'notEqual';//2;
    public static LESS_THAN = 'lessThan';//3;
    public static GREATER_THAN = 'greaterThan';//4;
    public static IN_RANGE = 'inRange';//5;


    private filterParams: IDateFilterParams;
    private applyActive: boolean;


    @Autowired('gridOptionsWrapper')
    private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired('context')
    private context: Context;

    @QuerySelector('#filterDateTo')
    private eDateToInput: HTMLInputElement;

    @QuerySelector('#filterDateFrom')
    private eDateFromInput: HTMLInputElement;

    @QuerySelector('#filterDateToPanel')
    private eDateToPanel: HTMLElement;

    @QuerySelector('#applyPanel')
    private eApplyPanel: HTMLElement;

    @QuerySelector('#applyButton')
    private eApplyButton: HTMLElement;

    @QuerySelector('#filterType')
    private eTypeSelector: HTMLSelectElement;

    private dateFrom:Date;
    private dateTo:Date;
    private filter:string = 'equals';



    constructor() {
        super();
    }

    public init(params: IFilterParams): void {
        this.filterParams = <IDateFilterParams>params;
        this.applyActive = (<any>params).apply === true;
        let translate = this.gridOptionsWrapper.getLocaleTextFunc();

        this.setTemplate(`<div>
                    <div>
                        <select class="ag-filter-select" id="filterType">
                            <option value="${DateFilter.EQUALS}">${translate('equals', 'Equals')}</option>
                            <option value="${DateFilter.NOT_EQUAL}">${translate('notEqual', 'Not equal')}</option>
                            <option value="${DateFilter.LESS_THAN}">${translate('lessThan', 'Less than')}</option>
                            <option value="${DateFilter.GREATER_THAN}">${translate('greaterThan', 'Greater than')}</option>
                            <option value="${DateFilter.IN_RANGE}">${translate('inRange', 'In range')}</option>
                        </select>
                    </div>
                    <div class="ag-filter-date-from" id="filterDateFromPanel">
                        <input class="ag-filter-filter" id="filterDateFrom" type="date" placeholder="yyyy-mm-dd"/>
                    </div>
                    <div class="ag-filter-date-to" id="filterDateToPanel" style="display: none;">
                        <input class="ag-filter-filter" id="filterDateTo" type="date" placeholder="yyyy-mm-dd"/>
                    </div>
                    <div class="ag-filter-apply-panel" id="applyPanel">
                        <button type="button" id="applyButton">${translate('applyFilter', 'Apply Filter')}</button>
                    </div>
                </div>`);

        if (!this.applyActive){
            this.getGui().removeChild(this.eApplyPanel);
        }else{
            this.addDestroyableEventListener(this.eApplyButton, "click", ()=>{this.filterParams.filterChangedCallback()});
        }

        this.dynamicUi();

        this.instantiate(this.context);
        this.onInputChanged(this.eDateFromInput, this.onDateChanged.bind(this));
        this.onInputChanged(this.eDateToInput, this.onDateChanged.bind(this));
        this.onSelectChanged(this.eTypeSelector, this.onFilterTypeChanged.bind(this));
    }

    private onInputChanged (element:HTMLElement, listener: EventListener):void{
        this.addDestroyableEventListener(element, "input", listener);
    }

    private onSelectChanged (element:HTMLElement, listener: EventListener):void{
        this.addDestroyableEventListener(element, "change", listener);
    }

    private onDateChanged(): void {
        this.dateFrom = this.parseDate(this.eDateFromInput.value);
        this.dateTo = this.parseDate(this.eDateToInput.value);
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    }

    private onFilterTypeChanged (): void{
        this.filter = this.eTypeSelector.value;
        this.dynamicUi();
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    }

    private dynamicUi(){
        if ((this.filter === DateFilter.IN_RANGE)){
            this.eDateToPanel.style.display = 'block';
        }else{
            this.eDateToPanel.style.display = 'none';
        }
    }

    public isFilterActive(): boolean {
        if ((this.filter === DateFilter.IN_RANGE)) {
            return this.dateFrom != null && this.dateTo != null;
        }
        return this.dateFrom != null;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        var value:any = this.filterParams.valueGetter(params.node);
        let comparator: (filterDate:Date, cellValue:any)=>number = this.filterParams.comparator;

        let compareDateFromResult: number = comparator(this.dateFrom, value);

        if (this.filter === DateFilter.EQUALS){
            return compareDateFromResult === 0;
        }

        if (this.filter === DateFilter.GREATER_THAN){
            return compareDateFromResult > 0;
        }

        if (this.filter === DateFilter.LESS_THAN){
            return compareDateFromResult < 0;
        }

        if (this.filter === DateFilter.NOT_EQUAL){
            return compareDateFromResult != 0;
        }

        //From now on the type is a range
        let compareDateToResult: number = comparator(this.dateTo, value);
        if (this.filter === DateFilter.IN_RANGE){
            return compareDateFromResult > 0 && compareDateToResult < 0
        }

        throw new Error('Unexpected type of date filter!: ' + this.filter);
    }

    public getModel(): SerializedDateFilter {
        if (this.isFilterActive()) {
            return {
                dateFrom: this.serializeDate(this.dateFrom),
                dateTo: this.serializeDate(this.dateTo),
                filterType: this.filter
            };
        } else {
            return null;
        }
    }

    private setDateFrom (date:string):void{
        this.dateFrom = this.parseDate(date);
        this.eDateFromInput.value = date;
    }

    private setDateTo (date:string):void{
        this.dateTo = this.parseDate(date);
        this.eDateToInput.value = date;
    }

    private setFilterType (filterType:string):void{
        this.filter = filterType;
        this.eTypeSelector.value = filterType;
    }

    public setModel(model: SerializedDateFilter): void {
        if (model) {
            this.setDateFrom(model.dateFrom);
            this.setDateTo(model.dateTo);
            this.setFilterType(model.filterType);
        } else {
            this.setDateFrom(null);
            this.setDateTo(null);
            this.setFilterType("equals");
        }
    }

    private serializeDate (date:Date):string{
        if (!date) return null;
        return date.getFullYear() + "-" + this.pad(date.getMonth() + 1, 2) + "-" + this.pad(date.getDate(), 2)
    }

    private pad(num: number, totalStringSize:number) : string{
        let asString:string = num + "";
        while (asString.length < totalStringSize) asString = "0" + asString;
        return asString;
    }

    private parseDate (dateAsString:string):Date{
        try{
            if (!dateAsString) return null;
            if (dateAsString.indexOf("-") === -1) return null;

            let fields:string[] = dateAsString.split("-");
            if (fields.length != 3) return null;
            return new Date (Number(fields[0]),Number(fields[1]),Number(fields[2]));
        }catch (e){
            return null;
        }

    }

}
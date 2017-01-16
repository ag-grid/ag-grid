import {IFilter, IFilterParams, IDoesFilterPassParams, IAfterFilterGuiAttachedParams} from "../interfaces/iFilter";
import {Component} from "../widgets/component";
import {QuerySelector} from "../widgets/componentAnnotations";
import {Autowired, Context} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Utils} from "../utils";
import {IDateComponent, IDateComponentParams} from "../rendering/dateComponent";

export interface IDateFilterParams extends IFilterParams{
    comparator ?: (filterLocalDateAtMidnight:Date, cellValue:any)=>number;
    dateComponent ?: {new(): IDateComponent};
}

export interface SerializedDateFilter {
    dateFrom:string
    dateTo:string
    type:string
}

export class DateFilter extends Component implements IFilter {
    public static EQUALS = 'equals';// 1;
    public static NOT_EQUAL = 'notEqual';//2;
    public static LESS_THAN = 'lessThan';//3;
    public static GREATER_THAN = 'greaterThan';//4;
    public static IN_RANGE = 'inRange';//5;


    private filterParams: IDateFilterParams;
    private applyActive: boolean;
    private newRowsActionKeep: boolean;

    private dateToComponent:IDateComponent;
    private dateFromComponent:IDateComponent;


    @Autowired('gridOptionsWrapper')
    private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired('context')
    private context: Context;

    @QuerySelector('#filterDateFromPanel')
    private eDateFromPanel: HTMLElement;

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

    public init(params: IDateFilterParams): void {
        this.filterParams = <IDateFilterParams>params;
        this.applyActive = (<any>params).apply === true;
        this.newRowsActionKeep = (<any>params).newRowsAction === 'keep';

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
                    </div>
                    <div class="ag-filter-date-to" id="filterDateToPanel" style="display: none;">
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


        if (params.dateComponent){
            this.dateToComponent = new params.dateComponent();
            this.dateFromComponent = new params.dateComponent();
        }else{
            this.dateToComponent = new DefaultDateEditorRenderer(
                "filterDateTo",
                this.parseDate.bind(this),
                this.serializeDate.bind(this)
            );

            this.dateFromComponent = new DefaultDateEditorRenderer(
                "filterDateFrom",
                this.parseDate.bind(this),
                this.serializeDate.bind(this)
            );
        }


        let dateComponentParams: IDateComponentParams = {
            onDateChanged: this.onDateChanged.bind(this)
        };

        this.dateFromComponent.init(dateComponentParams);
        this.dateToComponent.init(dateComponentParams);

        this.dynamicUi();

        this.instantiate(this.context);

        this.onSelectChanged(this.eTypeSelector, this.onFilterTypeChanged.bind(this));
    }

    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.setFilterType(DateFilter.EQUALS);
            this.setDateFrom(null);
            this.setDateTo(null);
        }
    }

    private onSelectChanged (element:HTMLElement, listener: EventListener):void{
        this.addDestroyableEventListener(element, "change", listener);
    }

    private onDateChanged(): void {
        this.dateFrom = this.removeTimezone(this.dateFromComponent.getDate());
        this.dateTo = this.removeTimezone(this.dateToComponent.getDate());
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

        this.eDateFromPanel.appendChild(this.dateFromComponent.getGui());
        this.eDateToPanel.appendChild(this.dateToComponent.getGui());

        this.dateFromComponent.afterGuiAttached();
        this.dateToComponent.afterGuiAttached();
    }



    public isFilterActive(): boolean {
        if ((this.filter === DateFilter.IN_RANGE)) {
            return this.dateFrom != null && this.dateTo != null;
        }
        return this.dateFrom != null;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        var value:any = this.filterParams.valueGetter(params.node);
        let comparator: (filterDate:Date, cellValue:any)=>number = null;
        if (this.filterParams.comparator){
            comparator = this.filterParams.comparator;
        } else {
            comparator = this.defaultComparator.bind(this);
        }

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

    private defaultComparator (filterDate:Date, cellValue:any):number {
        //The default comparator assumes that the cellValue is a date
        let cellAsDate :Date = <Date> cellValue;
        if  (cellAsDate < filterDate) { return -1 }
        if  (cellAsDate > filterDate) { return 1 }
        return 0;
    }

    public getModel(): SerializedDateFilter {
        if (this.isFilterActive()) {
            return {
                dateTo: this.serializeDate(this.dateToComponent.getDate()),
                dateFrom: this.serializeDate(this.dateFromComponent.getDate()),
                type: this.filter
            };
        } else {
            return null;
        }
    }

    public getDateFrom ():string{
        return this.serializeDate(this.dateFromComponent.getDate());
    }

    public getDateTo ():string{
        return this.serializeDate(this.dateToComponent.getDate());
    }

    public getFilterType ():string{
        return this.filter;
    }

    public setDateFrom (date:string):void{
        this.dateFrom = this.parseDate(date);
        this.dateFromComponent.setDate(this.dateFrom);
    }

    public setDateTo (date:string):void{
        this.dateTo = this.parseDate(date);
        this.dateToComponent.setDate(this.dateTo)
    }

    public setFilterType (filterType:string):void{
        this.filter = filterType;
        this.eTypeSelector.value = filterType;
    }

    public setModel(model: SerializedDateFilter): void {
        if (model) {
            this.setDateFrom(model.dateFrom);
            this.setDateTo(model.dateTo);
            this.setFilterType(model.type);
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
            return new Date (Number(fields[0]),Number(fields[1]) - 1,Number(fields[2]));
        }catch (e){
            return null;
        }

    }

    private removeTimezone (from:Date):Date{
        if (!from) return null;
        return new Date (from.getFullYear(), from.getMonth(), from.getDate());
    }
}

export class DefaultDateEditorRenderer implements IDateComponent{
    private eDateInput:HTMLInputElement;
    private listener:()=>void;

    constructor(
        private inputId:string,
        private dateParser:(asString:string)=>Date,
        private dateSerializer:(asDate:Date)=>string
    ) {
    }

    init (params: IDateComponentParams):void{
        this.eDateInput = document.createElement("input");
        this.eDateInput.setAttribute("class", "ag-filter-filter");
        this.eDateInput.setAttribute("id", this.inputId);
        this.eDateInput.setAttribute("type", 'text');
        this.eDateInput.setAttribute("placeholder", 'yyyy-mm-dd');

        if (Utils.isBrowserChrome()){
            this.eDateInput.type = 'date';
        }
        this.listener = params.onDateChanged;

        this.eDateInput.addEventListener('input', this.listener);
    }

    getGui ():HTMLElement{
        return this.eDateInput;
    }


    getDate():Date {
        return this.dateParser(this.eDateInput.value);
    }

    setDate(date: Date): void {
        this.eDateInput.value = this.dateSerializer(date);
    }

    destroy(): void{
        this.eDateInput.removeEventListener('input', this.listener)
    }

    afterGuiAttached?(params?: IAfterFilterGuiAttachedParams): void{

    }
}
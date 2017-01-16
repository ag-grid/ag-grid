import {IFilter, IFilterParams, IDoesFilterPassParams, IAfterGuiAttachedParams} from "../interfaces/iFilter";
import {Component} from "../widgets/component";
import {QuerySelector} from "../widgets/componentAnnotations";
import {Autowired, Context} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Utils} from "../utils";
import {IDateComponent, IDateComponentParams} from "../rendering/dateComponent";

export interface IDateFilterParams extends IFilterParams{
    comparator ?: IDateComparatorFunc;
    dateComponent ?: {new(): IDateComponent};
}

export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight:Date, cellValue: any): number;
}

export interface SerializedDateFilter {
    dateFrom:string
    dateTo:string
    type:string
}

export class DateFilter extends Component implements IFilter {

    public static EQUALS = 'equals';
    public static NOT_EQUAL = 'notEqual';
    public static LESS_THAN = 'lessThan';
    public static GREATER_THAN = 'greaterThan';
    public static IN_RANGE = 'inRange';

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

    public init(params: IDateFilterParams): void {
        this.filterParams = <IDateFilterParams>params;
        this.applyActive = (<any>params).apply === true;
        this.newRowsActionKeep = (<any>params).newRowsAction === 'keep';

        this.setTemplate(this.generateTemplate());

        if (this.applyActive) {
            this.addDestroyableEventListener(this.eApplyButton, "click", this.filterParams.filterChangedCallback);
        } else {
            this.getGui().removeChild(this.eApplyPanel);
        }

        // can we do something like this? need to refactor out the requirement of the constructor parameters
        // let DateComponent = new params.dateComponent ? params.dateComponent : DefaultDateEditorRenderer;
        // this.dateToComponent = new DateComponent();
        // this.dateFromComponent = new DateComponent();

        if (params.dateComponent) {
            this.dateToComponent = new params.dateComponent();
            this.dateFromComponent = new params.dateComponent();
        } else {
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

        this.addInDateComponents();
        this.setVisibilityOnDateToPanel();

        this.instantiate(this.context);

        this.addDestroyableEventListener(this.eTypeSelector, "change", this.onFilterTypeChanged.bind(this));
    }

    private generateTemplate(): string {
        let translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return `<div>
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
                </div>`;
    }

    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.setFilterType(DateFilter.EQUALS);
            this.setDateFrom(null);
            this.setDateTo(null);
        }
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
        this.setVisibilityOnDateToPanel();
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    }

    private setVisibilityOnDateToPanel(): void {
        let visible = this.filter === DateFilter.IN_RANGE;
        Utils.setVisible(this.eDateToPanel, visible);
    }

    private addInDateComponents(){
        this.eDateFromPanel.appendChild(this.dateFromComponent.getGui());
        this.eDateToPanel.appendChild(this.dateToComponent.getGui());

        this.dateFromComponent.afterGuiAttached();
        this.dateToComponent.afterGuiAttached();
    }

    public isFilterActive(): boolean {
        if (this.filter === DateFilter.IN_RANGE) {
            return this.dateFrom != null && this.dateTo != null;
        } else {
            return this.dateFrom != null;
        }
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        var value:any = this.filterParams.valueGetter(params.node);
        let comparator: IDateComparatorFunc = null;
        if (this.filterParams.comparator){
            comparator = this.filterParams.comparator;
        } else {
            comparator = this.defaultComparator.bind(this);
        }

        let compareDateFromResult = comparator(this.dateFrom, value);

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
        let cellAsDate = <Date> cellValue;
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

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getDateFrom ():string{
        return this.serializeDate(this.dateFromComponent.getDate());
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getDateTo ():string{
        return this.serializeDate(this.dateToComponent.getDate());
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
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

export class DefaultDateEditorRenderer implements IDateComponent {

    private eDateInput:HTMLInputElement;
    private listener:()=>void;

    constructor(
        private inputId:string,
        private dateParser:(asString:string)=>Date,
        private dateSerializer:(asDate:Date)=>string
    ) {
    }

    public init (params: IDateComponentParams):void{
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

    public getGui():HTMLElement{
        return this.eDateInput;
    }


    public getDate():Date {
        return this.dateParser(this.eDateInput.value);
    }

    public setDate(date: Date): void {
        this.eDateInput.value = this.dateSerializer(date);
    }

    public destroy(): void{
        this.eDateInput.removeEventListener('input', this.listener)
    }
}
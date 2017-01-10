import {IFilter, IFilterParams, IDoesFilterPassParams} from "../interfaces/iFilter";
import {Component} from "../widgets/component";
import {QuerySelector, Listener} from "../widgets/componentAnnotations";
import {Autowired, Context} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export interface IDateFilterParams {
    comparator: (filterDate: Date, valueDate: any)=>number;
}

export class ButtonPanel extends Component {

    @Autowired('context')
    private context: Context;

    constructor() {
        super();
        this.setTemplate(`<div>Click Me!!!</div>`);
    }

    @Listener('click')
    private onClick(): void {
        console.log('button panel was clicked');
    }

    public sayHello(): void {
        console.log('hello');
    }
}

export class DateFilter extends Component implements IFilter {
    public static EQUALS = 'equals';// 1;
    public static NOT_EQUAL = 'notEqual';//2;
    public static LESS_THAN = 'lessThan';//3;
    public static GREATER_THAN = 'greaterThan';//4;
    public static IN_RANGE = 'inRange';//5;


    private filterParams: IFilterParams;
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

    @QuerySelector('#filterType')
    private eTypeSelector: HTMLSelectElement;

    constructor() {
        super();
    }

    public init(params: IFilterParams): void {
        this.filterParams = params;
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
                        <input class="ag-filter-filter" id="filterDateFrom" type="date" placeholder="${translate('filterOoo', 'Filter...')}"/>
                    </div>
                    <div class="ag-filter-date-to" id="filterDateToPanel" style="display: none;">
                        <input class="ag-filter-filter" id="filterDateTo" type="date" placeholder="${translate('filterOoo', 'Filter...')}"/>
                    </div>
                    <div class="ag-filter-apply-panel" id="applyPanel">
                        <button type="button" id="applyButton">${translate('applyFilter', 'Apply Filter')}</button>
                    </div>
                </div>`);

        if (!this.applyActive){
            this.getGui().removeChild(this.eApplyPanel);
        }

        this.instantiate(this.context);
        this.addDestroyableEventListener(this.eDateFromInput, 'change', this.onDateChanged.bind(this));
        this.addDestroyableEventListener(this.eDateToInput, 'change', this.onDateChanged.bind(this));
        this.addDestroyableEventListener(this.eTypeSelector, 'change', this.onFilterTypeChanged.bind(this));

        this.onFilterTypeChanged();
    }

    private onDateChanged(): void {
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    }

    private onFilterTypeChanged (): void{
        if ((this.eTypeSelector.value === DateFilter.IN_RANGE)){
            this.eDateToPanel.style.display = 'block';
        }else{
            this.eDateToPanel.style.display = 'none';
        }
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    }

    public isFilterActive(): boolean {
        if ((this.eTypeSelector.value === DateFilter.IN_RANGE)) {
            return this.eDateFromInput.valueAsDate != null && this.eDateToInput.valueAsDate != null;
        }

        return this.eDateFromInput.valueAsDate != null;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        return this.doFilter(params);
    }

    private doFilter (params: IDoesFilterPassParams):boolean{
        let toCheckDateAsString: string = this.filterParams.valueGetter(params.node);
        let dateParts: string[] = toCheckDateAsString.split("/");
        let current: Date = new Date(Number(dateParts[2]), Number(dateParts[1]), Number(dateParts[0]));

        let inputFromWithTimeZone: Date = this.eDateFromInput.valueAsDate;
        let inputFrom:Date = new Date (inputFromWithTimeZone.getFullYear(), inputFromWithTimeZone.getMonth() + 1, inputFromWithTimeZone.getDate());

        if (this.eTypeSelector.value === DateFilter.EQUALS){
            return inputFrom.getTime() === current.getTime();
        }

        if (this.eTypeSelector.value === DateFilter.GREATER_THAN){
            return current > inputFrom;
        }

        if (this.eTypeSelector.value === DateFilter.LESS_THAN){
            return current < inputFrom;
        }

        if (this.eTypeSelector.value === DateFilter.NOT_EQUAL){
            return inputFrom.getTime() !== current.getTime();
        }


        //From no ow the type is in_range or outside range
        let inputToWithTimeZone: Date = this.eDateToInput.valueAsDate;
        let inputTo:Date = new Date (inputToWithTimeZone.getFullYear(), inputFromWithTimeZone.getMonth() + 1, inputFromWithTimeZone.getDate());
        if (this.eTypeSelector.value === DateFilter.IN_RANGE){
            return current > inputFrom && current < inputTo
        }

        throw new Error('Unexpected type of date filter!: ' + this.eTypeSelector.value);
    }

    public getModel(): any {
    }

    public setModel(model: any): void {
    }

}
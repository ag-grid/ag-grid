import {Utils as _} from "../utils";
import {IFilterParams, IDoesFilterPassParams, IFilterComp} from "../interfaces/iFilter";
import {Autowired, Context} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {QuerySelector} from "../widgets/componentAnnotations";
import {Component} from "../widgets/component";

export class NumberFilter extends Component implements IFilterComp {

    public static EQUALS = 'equals';// 1;
    public static NOT_EQUAL = 'notEqual';//2;
    public static LESS_THAN = 'lessThan';//3;
    public static LESS_THAN_OR_EQUAL = 'lessThanOrEqual';//4;
    public static GREATER_THAN = 'greaterThan';//5;
    public static GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual';//6;
    public static IN_RANGE = 'inRange';

    private filterParams: IFilterParams;

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    
    @QuerySelector('#filterNumberToPanel')
    private eNumberToPanel: HTMLElement;

    private filterNumber: any;
    private filterNumberTo: any;
    private filterType: string;

    private applyActive: boolean;
    private newRowsActionKeep: boolean;

    @QuerySelector('#filterToText')
    private eFilterToTextField: HTMLInputElement;
    private eFilterTextField: HTMLInputElement;
    private eTypeSelect: HTMLSelectElement;
    private eApplyButton: HTMLButtonElement;

    public init(params: IFilterParams): void {
        this.filterParams = params;
        this.applyActive = (<any>params).apply === true;
        this.newRowsActionKeep = (<any>params).newRowsAction === 'keep';

        this.filterNumber = null;
        this.filterType = NumberFilter.EQUALS;
        this.createGui();


        this.instantiate(this.context);
    }

    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.setType(NumberFilter.EQUALS);
            this.setFilter(null);
        }
    }

    public afterGuiAttached() {
        this.eFilterTextField.focus();
    }

    public doesFilterPass(params: IDoesFilterPassParams) {
        if (this.filterNumber === null) {
            return true;
        }
        let value = this.filterParams.valueGetter(params.node);

        if (!value && value !== 0) {
            return false;
        }

        let valueAsNumber: any;
        if (typeof value === 'number') {
            valueAsNumber = value;
        } else {
            valueAsNumber = parseFloat(value);
        }

        switch (this.filterType) {
            case NumberFilter.EQUALS:
                return valueAsNumber === this.filterNumber;
            case NumberFilter.LESS_THAN:
                return valueAsNumber < this.filterNumber;
            case NumberFilter.GREATER_THAN:
                return valueAsNumber > this.filterNumber;
            case NumberFilter.LESS_THAN_OR_EQUAL:
                return valueAsNumber <= this.filterNumber;
            case NumberFilter.GREATER_THAN_OR_EQUAL:
                return valueAsNumber >= this.filterNumber;
            case NumberFilter.NOT_EQUAL:
                return valueAsNumber != this.filterNumber;
            case NumberFilter.IN_RANGE:
                return valueAsNumber >= this.filterNumber && valueAsNumber<=this.filterNumberTo;
            default:
                // should never happen
                console.warn('invalid filter type ' + this.filterType);
                return false;
        }
    }

    public isFilterActive() {
        if (this.filterType === NumberFilter.IN_RANGE) {
            return this.filterNumber != null && this.filterNumberTo != null;
        } else {
            return this.filterNumber != null;
        }
    }

    private createTemplate() {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return `<div>
                    <div>
                        <select class="ag-filter-select" id="filterType">
                            <option value="${NumberFilter.EQUALS}">${translate('equals', 'Equals')}</option>
                            <option value="${NumberFilter.NOT_EQUAL}">${translate('notEqual', 'Not equal')}</option>
                            <option value="${NumberFilter.LESS_THAN}">${translate('lessThan', 'Less than')}</option>
                            <option value="${NumberFilter.LESS_THAN_OR_EQUAL}">${translate('lessThanOrEqual', 'Less than or equal')}</option>
                            <option value="${NumberFilter.GREATER_THAN}">${translate('greaterThan', 'Greater than')}</option>
                            <option value="${NumberFilter.GREATER_THAN_OR_EQUAL}">${translate('greaterThanOrEqual', 'Greater than or equal')}</option>
                            <option value="${NumberFilter.IN_RANGE}">${translate('inRange', 'In range')}</option>
                        </select>
                    </div>
                    <div>
                        <input class="ag-filter-filter" id="filterText" type="text" placeholder="${translate('filterOoo', 'Filter...')}"/>
                    </div>
                     <div class="ag-filter-number-to" id="filterNumberToPanel">
                        <input class="ag-filter-filter" id="filterToText" type="text" placeholder="${translate('filterOoo', 'Filter...')}"/>
                    </div>
                    <div class="ag-filter-apply-panel" id="applyPanel">
                        <button type="button" id="applyButton">${translate('applyFilter', 'Apply Filter')}</button>
                    </div>
                </div>`;
    }

    private createGui() {
        this.setTemplate(this.createTemplate());
        this.eFilterTextField = <HTMLInputElement> this.getGui().querySelector("#filterText");
        this.eTypeSelect = <HTMLSelectElement> this.getGui().querySelector("#filterType");


        this.addDestroyableEventListener(this.eFilterTextField, "input", this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eFilterToTextField, "input", this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.eTypeSelect, "change", this.onTypeChanged.bind(this));

        this.setupApply();
        this.setVisibilityOnDateToPanel();
    }

    private setupApply() {
        if (this.applyActive) {
            this.eApplyButton = <HTMLButtonElement> this.getGui().querySelector('#applyButton');
            this.eApplyButton.addEventListener('click', () => {
                this.filterParams.filterChangedCallback();
            });
        } else {
            _.removeElement(this.getGui(), '#applyPanel');
        }
    }

    private onTypeChanged() {
        this.filterType = this.eTypeSelect.value;
        this.setVisibilityOnDateToPanel();
        this.filterChanged();
    }

    private filterChanged() {
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    }

    private onFilterChanged() {
        let newFilter = this.stringToFloat(this.eFilterTextField.value);
        let newFilterTo = this.stringToFloat(this.eFilterToTextField.value);
        if (this.filterNumber !== newFilter || this.filterNumberTo !== newFilterTo) {
            this.filterNumber = newFilter;
            this.filterNumberTo = newFilterTo;
            this.filterChanged();
            this.setVisibilityOnDateToPanel();
        }
    }

    private stringToFloat(value:string) :number{
        var filterText = _.makeNull(value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        var newFilter: number;
        if (filterText !== null && filterText !== undefined) {
            newFilter = parseFloat(filterText);
        } else {
            newFilter = null;
        }
        return newFilter;
    }

    public setType(type: string): void {
        this.filterType = type;
        this.eTypeSelect.value = type;
    }

    public setFilter(filter: any) {
        filter = _.makeNull(filter);

        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        this.filterNumber = filter;
        this.eFilterTextField.value = filter;
    }

    public setFilterTo(filter: any) {
        filter = _.makeNull(filter);

        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        this.filterNumberTo = filter;
        this.eFilterToTextField.value = filter;
    }

    public getFilter() {
        return this.filterNumber;
    }

    public getModel(): any {
        if (this.isFilterActive()) {
            return {
                type: this.filterType,
                filter: this.filterNumber,
                filterTo: this.filterNumberTo
            };
        } else {
            return null;
        }
    }

    public setModel(model: any): void {
        if (model) {
            this.setType(model.type);
            this.setFilter(model.filter);
            this.setFilterTo(model.filterTo);
        } else {
            this.setType(NumberFilter.EQUALS);
            this.setFilter(null);
            this.setFilterTo(null);
        }
        this.setVisibilityOnDateToPanel();
    }

    private setVisibilityOnDateToPanel(): void {
        let visible = this.filterType === NumberFilter.IN_RANGE;
        _.setVisible(this.eNumberToPanel, visible);
    }
}

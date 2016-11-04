import {Utils as _} from '../utils';
import {IFilter, IFilterParams, IDoesFilterPassParams} from "../interfaces/iFilter";
import {Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export class NumberFilter implements IFilter {

    public static EQUALS = 'equals';// 1;
    public static NOT_EQUAL = 'notEqual';//2;
    public static LESS_THAN = 'lessThan';//3;
    public static LESS_THAN_OR_EQUAL = 'lessThanOrEqual';//4;
    public static GREATER_THAN = 'greaterThan';//5;
    public static GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual';//6;

    private filterParams: IFilterParams;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private filterNumber: any;
    private filterType: string;

    private applyActive: boolean;
    private newRowsActionKeep: boolean;

    private eGui: HTMLElement;
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
        var value = this.filterParams.valueGetter(params.node);

        if (!value && value !== 0) {
            return false;
        }

        var valueAsNumber: any;
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
            default:
                // should never happen
                console.warn('invalid filter type ' + this.filterType);
                return false;
        }
    }

    public getGui() {
        return this.eGui;
    }

    public isFilterActive() {
        return this.filterNumber !== null;
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
                        </select>
                    </div>
                    <div>
                        <input class="ag-filter-filter" id="filterText" type="text" placeholder="${translate('filterOoo', 'Filter...')}"/>
                    </div>
                    <div class="ag-filter-apply-panel" id="applyPanel">
                        <button type="button" id="applyButton">${translate('applyFilter', 'Apply Filter')}</button>
                    </div>
                </div>`;
    }

    private createGui() {
        this.eGui = _.loadTemplate(this.createTemplate());
        this.eFilterTextField = <HTMLInputElement> this.eGui.querySelector("#filterText");
        this.eTypeSelect = <HTMLSelectElement> this.eGui.querySelector("#filterType");

        _.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
        this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));

        this.setupApply();
    }

    private setupApply() {
        if (this.applyActive) {
            this.eApplyButton = <HTMLButtonElement> this.eGui.querySelector('#applyButton');
            this.eApplyButton.addEventListener('click', () => {
                this.filterParams.filterChangedCallback();
            });
        } else {
            _.removeElement(this.eGui, '#applyPanel');
        }
    }

    private onTypeChanged() {
        this.filterType = this.eTypeSelect.value;
        this.filterChanged();
    }

    private filterChanged() {
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    }

    private onFilterChanged() {
        var filterText = _.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        var newFilter: number;
        if (filterText !== null && filterText !== undefined) {
            newFilter = parseFloat(filterText);
        } else {
            newFilter = null;
        }
        if (this.filterNumber !== newFilter) {
            this.filterNumber = newFilter;
            this.filterChanged();
        }
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

    public getFilter() {
        return this.filterNumber;
    }

    public getModel(): any {
        if (this.isFilterActive()) {
            return {
                type: this.filterType,
                filter: this.filterNumber
            };
        } else {
            return null;
        }
    }

    public setModel(model: any): void {
        if (model) {
            this.setType(model.type);
            this.setFilter(model.filter);
        } else {
            this.setFilter(null);
        }
    }
}

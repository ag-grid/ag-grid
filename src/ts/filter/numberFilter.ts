import {Utils as _} from '../utils';
import {Filter} from "./filter";

var template =
        '<div>'+
            '<div>'+
                '<select class="ag-filter-select" id="filterType">'+
                    '<option value="1">[EQUALS]</option>'+
                    '<option value="2">[NOT EQUAL]</option>'+
                    '<option value="3">[LESS THAN]</option>'+
                    '<option value="4">[LESS THAN OR EQUAL]</option>'+
                    '<option value="5">[GREATER THAN]</option>'+
                    '<option value="6">[GREATER THAN OR EQUAL]</option>'+
                '</select>'+
            '</div>'+
            '<div>'+
                '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>'+
            '</div>'+
            '<div class="ag-filter-apply-panel" id="applyPanel">'+
                '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
            '</div>'+
        '</div>';

var EQUALS = 1;
var NOT_EQUAL = 2;
var LESS_THAN = 3;
var LESS_THAN_OR_EQUAL = 4;
var GREATER_THAN = 5;
var GREATER_THAN_OR_EQUAL = 6;

export class NumberFilter implements Filter {

    private filterParams: any;
    private filterChangedCallback: any;
    private filterModifiedCallback: any;
    private localeTextFunc: any;
    private valueGetter: any;
    private filterNumber: any;
    private filterType: any;
    private api: any;

    private eGui: any;
    private eFilterTextField: any;
    private eTypeSelect: any;
    private applyActive: any;
    private eApplyButton: any;

    public init(params: any): void {
        this.filterParams = params.filterParams;
        this.applyActive = this.filterParams && this.filterParams.apply === true;
        this.filterChangedCallback = params.filterChangedCallback;
        this.filterModifiedCallback = params.filterModifiedCallback;
        this.localeTextFunc = params.localeTextFunc;
        this.valueGetter = params.valueGetter;
        this.createGui();
        this.filterNumber = null;
        this.filterType = EQUALS;
        this.createApi();
    }

    public onNewRowsLoaded() {
        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        if (!keepSelection) {
            this.api.setType(EQUALS);
            this.api.setFilter(null);
        }
    }

    public afterGuiAttached() {
        this.eFilterTextField.focus();
    }

    public doesFilterPass(node: any) {
        if (this.filterNumber === null) {
            return true;
        }
        var value = this.valueGetter(node);

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
            case EQUALS:
                return valueAsNumber === this.filterNumber;
            case LESS_THAN:
                return valueAsNumber < this.filterNumber;
            case GREATER_THAN:
                return valueAsNumber > this.filterNumber;
            case LESS_THAN_OR_EQUAL:
                return valueAsNumber <= this.filterNumber;
            case GREATER_THAN_OR_EQUAL:
                return valueAsNumber >= this.filterNumber;
            case NOT_EQUAL:
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
        return template
            .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
            .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
            .replace('[LESS THAN]', this.localeTextFunc('lessThan', 'Less than'))
            .replace('[GREATER THAN]', this.localeTextFunc('greaterThan', 'Greater than'))
            .replace('[LESS THAN OR EQUAL]', this.localeTextFunc('lessThanOrEqual', 'Less than or equal'))
            .replace('[GREATER THAN OR EQUAL]', this.localeTextFunc('greaterThanOrEqual', 'Greater than or equal'))
            .replace('[NOT EQUAL]', this.localeTextFunc('notEqual', 'Not equal'))
            .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
    }

    private createGui() {
        this.eGui = _.loadTemplate(this.createTemplate());
        this.eFilterTextField = this.eGui.querySelector("#filterText");
        this.eTypeSelect = this.eGui.querySelector("#filterType");

        _.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
        this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));

        this.setupApply();
    }

    private setupApply() {
        if (this.applyActive) {
            this.eApplyButton = this.eGui.querySelector('#applyButton');
            this.eApplyButton.addEventListener('click', () => {
                this.filterChangedCallback();
            });
        } else {
            _.removeElement(this.eGui, '#applyPanel');
        }
    }

    private onTypeChanged() {
        this.filterType = parseInt(this.eTypeSelect.value);
        this.filterChanged();
    }

    private filterChanged() {
        this.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterChangedCallback();
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

    private createApi() {
        var that = this;
        this.api = {
            EQUALS: EQUALS,
            NOT_EQUAL: NOT_EQUAL,            
            LESS_THAN: LESS_THAN,
            GREATER_THAN: GREATER_THAN,
            LESS_THAN_OR_EQUAL: LESS_THAN_OR_EQUAL,
            GREATER_THAN_OR_EQUAL: GREATER_THAN_OR_EQUAL,
            setType: function (type: any) {
                that.filterType = type;
                that.eTypeSelect.value = type;
            },
            setFilter: function (filter: any) {
                filter = _.makeNull(filter);

                if (filter !== null && !(typeof filter === 'number')) {
                    filter = parseFloat(filter);
                }
                that.filterNumber = filter;
                that.eFilterTextField.value = filter;
            },
            getType: function () {
                return that.filterType;
            },
            getFilter: function () {
                return that.filterNumber;
            },
            getModel: function () {
                if (that.isFilterActive()) {
                    return {
                        type: that.filterType,
                        filter: that.filterNumber
                    };
                } else {
                    return null;
                }
            },
            setModel: function (dataModel: any) {
                if (dataModel) {
                    this.setType(dataModel.type);
                    this.setFilter(dataModel.filter);
                } else {
                    this.setFilter(null);
                }
            }
        };
    }

    public getApi() {
        return this.api;
    }
}

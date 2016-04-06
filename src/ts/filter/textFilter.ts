import {Utils as _} from '../utils';
import {Filter} from "./filter";

var template =
        '<div>'+
            '<div>'+
                '<select class="ag-filter-select" id="filterType">'+
                    '<option value="1">[CONTAINS]</option>'+
                    '<option value="2">[EQUALS]</option>'+
                    '<option value="3">[NOT EQUALS]</option>'+
                    '<option value="4">[STARTS WITH]</option>'+
                    '<option value="5">[ENDS WITH]</option>'+
                '</select>'+
            '</div>'+
            '<div>'+
                '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>'+
            '</div>'+
            '<div class="ag-filter-apply-panel" id="applyPanel">'+
                '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
            '</div>'+
        '</div>';

var CONTAINS = 1;
var EQUALS = 2;
var NOT_EQUALS = 3;
var STARTS_WITH = 4;
var ENDS_WITH = 5;

export class TextFilter implements Filter {

    private filterParams: any;
    private filterChangedCallback: any;
    private filterModifiedCallback: any;
    private localeTextFunc: any;
    private valueGetter: any;
    private filterText: any;
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
        this.filterText = null;
        this.filterType = CONTAINS;
        this.createApi();
    }

    public onNewRowsLoaded() {
        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        if (!keepSelection) {
            this.api.setType(CONTAINS);
            this.api.setFilter(null);
        }
    }

    public afterGuiAttached() {
        this.eFilterTextField.focus();
    }

    public doesFilterPass(node: any) {
        if (!this.filterText) {
            return true;
        }
        var value = this.valueGetter(node);
        if (!value) {
            return false;
        }
        var valueLowerCase = value.toString().toLowerCase();
        switch (this.filterType) {
            case CONTAINS:
                return valueLowerCase.indexOf(this.filterText) >= 0;
            case EQUALS:
                return valueLowerCase === this.filterText;
            case NOT_EQUALS:
                return valueLowerCase != this.filterText;
            case STARTS_WITH:
                return valueLowerCase.indexOf(this.filterText) === 0;
            case ENDS_WITH:
                var index = valueLowerCase.lastIndexOf(this.filterText);
                return index >= 0 && index === (valueLowerCase.length - this.filterText.length);
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
        return this.filterText !== null;
    }

    private createTemplate() {
        return template
            .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
            .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
            .replace('[NOT EQUALS]', this.localeTextFunc('notEquals', 'Not equals'))
            .replace('[CONTAINS]', this.localeTextFunc('contains', 'Contains'))
            .replace('[STARTS WITH]', this.localeTextFunc('startsWith', 'Starts with'))
            .replace('[ENDS WITH]', this.localeTextFunc('endsWith', 'Ends with'))
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

    private onFilterChanged() {
        var filterText = _.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        var newFilterText: string;
        if (filterText!==null && filterText!==undefined) {
            newFilterText = filterText.toLowerCase();
        } else {
            newFilterText = null;
        }
        if (this.filterText !== newFilterText) {
            this.filterText = newFilterText;
            this.filterChanged();
        }
    }

    private filterChanged() {
        this.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterChangedCallback();
        }
    }

    private createApi() {
        var that = this;
        this.api = {
            EQUALS: EQUALS,
            NOT_EQUALS: NOT_EQUALS,
            CONTAINS: CONTAINS,
            STARTS_WITH: STARTS_WITH,
            ENDS_WITH: ENDS_WITH,
            setType: function (type: any) {
                that.filterType = type;
                that.eTypeSelect.value = type;
            },
            setFilter: function (filter: any) {
                filter = _.makeNull(filter);

                if (filter) {
                    that.filterText = filter.toLowerCase();
                    that.eFilterTextField.value = filter;
                } else {
                    that.filterText = null;
                    that.eFilterTextField.value = null;
                }
            },
            getType: function () {
                return that.filterType;
            },
            getFilter: function () {
                return that.filterText;
            },
            getModel: function () {
                if (that.isFilterActive()) {
                    return {
                        type: that.filterType,
                        filter: that.filterText
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

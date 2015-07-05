/// <reference path="../utils.ts" />

module awk.grid {

    var utils = Utils;

    var template =
            '<div>'+
                '<div>'+
                    '<select class="ag-filter-select" id="filterType">'+
                        '<option value="1">[EQUALS]</option>'+
                        '<option value="2">[LESS THAN]</option>'+
                        '<option value="3">[GREATER THAN]</option>'+
                    '</select>'+
                '</div>'+
                '<div>'+
                    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>'+
                '</div>'+
            '</div>';

    var EQUALS = 1;
    var LESS_THAN = 2;
    var GREATER_THAN = 3;

    export class NumberFilter {

        filterParams: any;
        filterChangedCallback: any;
        localeTextFunc: any;
        valueGetter: any;
        filterNumber: any;
        filterType: any;
        api: any;

        eGui: any;
        eFilterTextField: any;
        eTypeSelect: any;

        constructor(params: any) {
            this.filterParams = params.filterParams;
            this.filterChangedCallback = params.filterChangedCallback;
            this.localeTextFunc = params.localeTextFunc;
            this.valueGetter = params.valueGetter;
            this.createGui();
            this.filterNumber = null;
            this.filterType = EQUALS;
            this.createApi();
        }

        /* public */
        onNewRowsLoaded() {
            var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
            if (!keepSelection) {
                this.api.setType(EQUALS);
                this.api.setFilter(null);
            }
        }

        /* public */
        afterGuiAttached() {
            this.eFilterTextField.focus();
        }

        /* public */
        doesFilterPass(node: any) {
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
                    return valueAsNumber <= this.filterNumber;
                case GREATER_THAN:
                    return valueAsNumber >= this.filterNumber;
                default:
                    // should never happen
                    console.warn('invalid filter type ' + this.filterType);
                    return false;
            }
        }

        /* public */
        getGui() {
            return this.eGui;
        }

        /* public */
        isFilterActive() {
            return this.filterNumber !== null;
        }

        createTemplate() {
            return template
                .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
                .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
                .replace('[LESS THAN]', this.localeTextFunc('lessThan', 'Less than'))
                .replace('[GREATER THAN]', this.localeTextFunc('greaterThan', 'Greater than'));
        }

        createGui() {
            this.eGui = utils.loadTemplate(this.createTemplate());
            this.eFilterTextField = this.eGui.querySelector("#filterText");
            this.eTypeSelect = this.eGui.querySelector("#filterType");

            utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
            this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
        }

        onTypeChanged() {
            this.filterType = parseInt(this.eTypeSelect.value);
            this.filterChangedCallback();
        }

        onFilterChanged() {
            var filterText = utils.makeNull(this.eFilterTextField.value);
            if (filterText && filterText.trim() === '') {
                filterText = null;
            }
            if (filterText) {
                this.filterNumber = parseFloat(filterText);
            } else {
                this.filterNumber = null;
            }
            this.filterChangedCallback();
        }

        createApi() {
            var that = this;
            this.api = {
                EQUALS: EQUALS,
                LESS_THAN: LESS_THAN,
                GREATER_THAN: GREATER_THAN,
                setType: function (type: any) {
                    that.filterType = type;
                    that.eTypeSelect.value = type;
                },
                setFilter: function (filter: any) {
                    filter = utils.makeNull(filter);

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

        getApi() {
            return this.api;
        }
    }
}


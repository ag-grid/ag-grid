/// <reference path="../utils.ts" />
/// <reference path="textAndNumberFilterParameters.ts" />

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
                '<div class="ag-filter-apply-panel" id="applyPanel">'+
                    '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
                '</div>'+
            '</div>';

    var EQUALS = 1;
    var LESS_THAN = 2;
    var GREATER_THAN = 3;

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
            this.applyActive = this.filterParams && this.filterParams.apply == true;
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
                .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
        }

        private createGui() {
            this.eGui = utils.loadTemplate(this.createTemplate());
            this.eFilterTextField = this.eGui.querySelector("#filterText");
            this.eTypeSelect = this.eGui.querySelector("#filterType");

            utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
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
                utils.removeElement(this.eGui, '#applyPanel');
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
            var filterText = utils.makeNull(this.eFilterTextField.value);
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

        private getApi() {
            return this.api;
        }
    }
}


/// <reference path="../utils.ts" />
/// <reference path="setFilterModel.ts" />
/// <reference path="setFilterParameters.ts" />

module awk.grid {

    var _ = Utils;

    var template =
        '<div>'+
            '<div class="ag-filter-header-container">'+
                '<input class="ag-filter-filter" type="text" placeholder="[SEARCH...]"/>'+
            '</div>'+
            '<div class="ag-filter-header-container">'+
                '<label>'+
                    '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>'+
                    '([SELECT ALL])'+
                '</label>'+
            '</div>'+
            '<div class="ag-filter-list-viewport">'+
                '<div class="ag-filter-list-container">'+
                    '<div id="itemForRepeat" class="ag-filter-item">'+
                        '<label>'+
                            '<input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>'+
                            '<span class="ag-filter-value"></span>'+
                        '</label>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div class="ag-filter-apply-panel" id="applyPanel">'+
                '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
            '</div>'+
        '</div>';

    var DEFAULT_ROW_HEIGHT = 20;

    export class SetFilter implements Filter {

        private eGui: any;
        private filterParams: any;
        private rowHeight: any;
        private model: any;
        private filterChangedCallback: any;
        private filterModifiedCallback: any;
        private valueGetter: any;
        private rowsInBodyContainer: any;
        private colDef: any;
        private localeTextFunc: any;
        private cellRenderer: any;

        private eListContainer: any;
        private eFilterValueTemplate: any;
        private eSelectAll: any;
        private eListViewport: any;
        private eMiniFilter: any;
        private api: any;
        private applyActive: any;
        private eApplyButton: any;

        public init(params: any): void {
            this.filterParams = params.filterParams;
            this.rowHeight = (this.filterParams && this.filterParams.cellHeight) ? this.filterParams.cellHeight : DEFAULT_ROW_HEIGHT;
            this.applyActive = this.filterParams && this.filterParams.apply == true;
            this.model = new SetFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter);
            this.filterChangedCallback = params.filterChangedCallback;
            this.filterModifiedCallback = params.filterModifiedCallback;
            this.valueGetter = params.valueGetter;
            this.rowsInBodyContainer = {};
            this.colDef = params.colDef;
            this.localeTextFunc = params.localeTextFunc;
            if (this.filterParams) {
                this.cellRenderer = this.filterParams.cellRenderer;
            }
            this.createGui();
            this.addScrollListener();
            this.createApi();
        }

        // we need to have the gui attached before we can draw the virtual rows, as the
        // virtual row logic needs info about the gui state
        public afterGuiAttached(): void  {
            this.drawVirtualRows();
        }

        public isFilterActive(): boolean {
            return this.model.isFilterActive();
        }

        public doesFilterPass(node: any): boolean {

            // if no filter, always pass
            if (this.model.isEverythingSelected()) {
                return true;
            }
            // if nothing selected in filter, always fail
            if (this.model.isNothingSelected()) {
                return false;
            }

            var value = this.valueGetter(node);
            value = _.makeNull(value);

            if (Array.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    if (this.model.isValueSelected(value[i])) {
                        return true
                    }
                }
                return false
            } else {
                return this.model.isValueSelected(value);
            }
        }

        public getGui(): any {
            return this.eGui;
        }

        public onNewRowsLoaded(): void {
            var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
            var isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
            // default is reset
            this.model.refreshAfterNewRowsLoaded(keepSelection, isSelectAll);
            this.setContainerHeight();
            this.refreshVirtualRows();
        }

        public onAnyFilterChanged(): void {
            this.model.refreshAfterAnyFilterChanged();
            this.setContainerHeight();
            this.refreshVirtualRows();
        }

        private createTemplate() {
            return template
                .replace('[SELECT ALL]', this.localeTextFunc('selectAll', 'Select All'))
                .replace('[SEARCH...]', this.localeTextFunc('searchOoo', 'Search...'))
                .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
        }

        private createGui() {
            var _this = this;

            this.eGui = _.loadTemplate(this.createTemplate());

            this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
            this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
            this.eSelectAll = this.eGui.querySelector("#selectAll");
            this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
            this.eMiniFilter = this.eGui.querySelector(".ag-filter-filter");
            this.eListContainer.style.height = (this.model.getUniqueValueCount() * this.rowHeight) + "px";

            this.setContainerHeight();
            this.eMiniFilter.value = this.model.getMiniFilter();
            _.addChangeListener(this.eMiniFilter, function () {
                _this.onMiniFilterChanged();
            });
            _.removeAllChildren(this.eListContainer);

            this.eSelectAll.onclick = this.onSelectAll.bind(this);

            if (this.model.isEverythingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = true;
            } else if (this.model.isNothingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = false;
            } else {
                this.eSelectAll.indeterminate = true;
            }

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

        private setContainerHeight() {
            this.eListContainer.style.height = (this.model.getDisplayedValueCount() * this.rowHeight) + "px";
        }

        private drawVirtualRows() {
            var topPixel = this.eListViewport.scrollTop;
            var bottomPixel = topPixel + this.eListViewport.offsetHeight;

            var firstRow = Math.floor(topPixel / this.rowHeight);
            var lastRow = Math.floor(bottomPixel / this.rowHeight);

            this.ensureRowsRendered(firstRow, lastRow);
        }

        private ensureRowsRendered(start: any, finish: any) {
            var _this = this;

            //at the end, this array will contain the items we need to remove
            var rowsToRemove = Object.keys(this.rowsInBodyContainer);

            //add in new rows
            for (var rowIndex = start; rowIndex <= finish; rowIndex++) {
                //see if item already there, and if yes, take it out of the 'to remove' array
                if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                    rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                    continue;
                }
                //check this row actually exists (in case overflow buffer window exceeds real data)
                if (this.model.getDisplayedValueCount() > rowIndex) {
                    var value = this.model.getDisplayedValue(rowIndex);
                    _this.insertRow(value, rowIndex);
                }
            }

            //at this point, everything in our 'rowsToRemove' . . .
            this.removeVirtualRows(rowsToRemove);
        }

        //takes array of row id's
        private removeVirtualRows(rowsToRemove: any) {
            var _this = this;
            rowsToRemove.forEach(function (indexToRemove: any) {
                var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
                _this.eListContainer.removeChild(eRowToRemove);
                delete _this.rowsInBodyContainer[indexToRemove];
            });
        }

        private insertRow(value: any, rowIndex: any) {
            var _this = this;

            var eFilterValue = this.eFilterValueTemplate.cloneNode(true);

            var valueElement = eFilterValue.querySelector(".ag-filter-value");
            if (this.cellRenderer) {
                //renderer provided, so use it
                var resultFromRenderer = this.cellRenderer({
                    value: value
                });

                if (_.isNode(resultFromRenderer)) {
                    //a dom node or element was returned, so add child
                    valueElement.appendChild(resultFromRenderer);
                } else {
                    //otherwise assume it was html, so just insert
                    valueElement.innerHTML = resultFromRenderer;
                }

            } else {
                //otherwise display as a string
                var blanksText = '(' + this.localeTextFunc('blanks', 'Blanks') + ')';
                var displayNameOfValue = value === null ? blanksText : value;
                valueElement.innerHTML = displayNameOfValue;
            }
            var eCheckbox = eFilterValue.querySelector("input");
            eCheckbox.checked = this.model.isValueSelected(value);

            eCheckbox.onclick = function () {
                _this.onCheckboxClicked(eCheckbox, value);
            };

            eFilterValue.style.top = (this.rowHeight * rowIndex) + "px";

            this.eListContainer.appendChild(eFilterValue);
            this.rowsInBodyContainer[rowIndex] = eFilterValue;
        }

        private onCheckboxClicked(eCheckbox: any, value: any) {
            var checked = eCheckbox.checked;
            if (checked) {
                this.model.selectValue(value);
                if (this.model.isEverythingSelected()) {
                    this.eSelectAll.indeterminate = false;
                    this.eSelectAll.checked = true;
                } else {
                    this.eSelectAll.indeterminate = true;
                }
            } else {
                this.model.unselectValue(value);
                //if set is empty, nothing is selected
                if (this.model.isNothingSelected()) {
                    this.eSelectAll.indeterminate = false;
                    this.eSelectAll.checked = false;
                } else {
                    this.eSelectAll.indeterminate = true;
                }
            }

            this.filterChanged();
        }

        private filterChanged() {
            this.filterModifiedCallback();
            if (!this.applyActive) {
                this.filterChangedCallback();
            }
        }

        private onMiniFilterChanged() {
            var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
            if (miniFilterChanged) {
                this.setContainerHeight();
                this.refreshVirtualRows();
            }
        }

        private refreshVirtualRows() {
            this.clearVirtualRows();
            this.drawVirtualRows();
        }

        private clearVirtualRows() {
            var rowsToRemove = Object.keys(this.rowsInBodyContainer);
            this.removeVirtualRows(rowsToRemove);
        }

        private onSelectAll() {
            var checked = this.eSelectAll.checked;
            if (checked) {
                this.model.selectEverything();
            } else {
                this.model.selectNothing();
            }
            this.updateAllCheckboxes(checked);
            this.filterChanged();
        }

        private updateAllCheckboxes(checked: any) {
            var currentlyDisplayedCheckboxes: any = this.eListContainer.querySelectorAll("[filter-checkbox=true]");
            for (var i = 0, l = currentlyDisplayedCheckboxes.length; i < l; i++) {
                currentlyDisplayedCheckboxes[i].checked = checked;
            }
        }

        private addScrollListener() {
            var _this = this;

            this.eListViewport.addEventListener("scroll", function () {
                _this.drawVirtualRows();
            });
        }

        public getApi() {
            return this.api;
        }

        private createApi() {
            var model = this.model;
            var that = this;
            this.api = {
                setMiniFilter: function (newMiniFilter: any) {
                    model.setMiniFilter(newMiniFilter);
                },
                getMiniFilter: function () {
                    return model.getMiniFilter();
                },
                selectEverything: function () {
                    that.eSelectAll.indeterminate = false;
                    that.eSelectAll.checked = true;
                    // not sure if we need to call this, as checking the checkout above might
                    // fire events.
                    model.selectEverything();
                },
                isFilterActive: function () {
                    return model.isFilterActive();
                },
                selectNothing: function () {
                    that.eSelectAll.indeterminate = false;
                    that.eSelectAll.checked = false;
                    // not sure if we need to call this, as checking the checkout above might
                    // fire events.
                    model.selectNothing();
                },
                unselectValue: function (value: any) {
                    model.unselectValue(value);
                    that.refreshVirtualRows();
                },
                selectValue: function (value: any) {
                    model.selectValue(value);
                    that.refreshVirtualRows();
                },
                isValueSelected: function (value: any) {
                    return model.isValueSelected(value);
                },
                isEverythingSelected: function () {
                    return model.isEverythingSelected();
                },
                isNothingSelected: function () {
                    return model.isNothingSelected();
                },
                getUniqueValueCount: function () {
                    return model.getUniqueValueCount();
                },
                getUniqueValue: function (index: any) {
                    return model.getUniqueValue(index);
                },
                getModel: function () {
                    return model.getModel();
                },
                setModel: function (dataModel: any) {
                    model.setModel(dataModel);
                    that.refreshVirtualRows();
                }
            };
        }
    }
}


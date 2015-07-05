/// <reference path="../utils.ts" />
/// <reference path="setFilterModel.ts" />

module awk.grid {

    var utils = Utils;

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
        '</div>';

    var DEFAULT_ROW_HEIGHT = 20;

    export class SetFilter {

        eGui: any;
        filterParams: any;
        rowHeight: any;
        model: any;
        filterChangedCallback: any;
        valueGetter: any;
        rowsInBodyContainer: any;
        colDef: any;
        localeTextFunc: any;
        cellRenderer: any;

        eListContainer: any;
        eFilterValueTemplate: any;
        eSelectAll: any;
        eListViewport: any;
        eMiniFilter: any;
        api: any;

        constructor(params: any) {
            this.filterParams = params.filterParams;
            this.rowHeight = (this.filterParams && this.filterParams.cellHeight) ? this.filterParams.cellHeight : DEFAULT_ROW_HEIGHT;
            this.model = new SetFilterModel(params.colDef, params.rowModel, params.valueGetter);
            this.filterChangedCallback = params.filterChangedCallback;
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
        /* public */
        afterGuiAttached()  {
            this.drawVirtualRows();
        }

        /* public */
        isFilterActive() {
            return this.model.isFilterActive();
        }

        /* public */
        doesFilterPass(node: any) {

            //if no filter, always pass
            if (this.model.isEverythingSelected()) {
                return true;
            }
            //if nothing selected in filter, always fail
            if (this.model.isNothingSelected()) {
                return false;
            }

            var value = this.valueGetter(node);
            value = utils.makeNull(value);

            var filterPassed = this.model.isValueSelected(value);
            return filterPassed;
        }

        /* public */
        getGui() {
            return this.eGui;
        }

        /* public */
        onNewRowsLoaded() {
            var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
            // default is reset
            this.model.refreshUniqueValues(keepSelection);
            this.setContainerHeight();
            this.refreshVirtualRows();
        }

        createTemplate() {
            return template
                .replace('[SELECT ALL]', this.localeTextFunc('selectAll', 'Select All'))
                .replace('[SEARCH...]', this.localeTextFunc('searchOoo', 'Search...'));
        }

        createGui() {
            var _this = this;

            this.eGui = utils.loadTemplate(this.createTemplate());

            this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
            this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
            this.eSelectAll = this.eGui.querySelector("#selectAll");
            this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
            this.eMiniFilter = this.eGui.querySelector(".ag-filter-filter");
            this.eListContainer.style.height = (this.model.getUniqueValueCount() * this.rowHeight) + "px";

            this.setContainerHeight();
            this.eMiniFilter.value = this.model.getMiniFilter();
            utils.addChangeListener(this.eMiniFilter, function () {
                _this.onMiniFilterChanged();
            });
            utils.removeAllChildren(this.eListContainer);

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
        }

        setContainerHeight() {
            this.eListContainer.style.height = (this.model.getDisplayedValueCount() * this.rowHeight) + "px";
        }

        drawVirtualRows() {
            var topPixel = this.eListViewport.scrollTop;
            var bottomPixel = topPixel + this.eListViewport.offsetHeight;

            var firstRow = Math.floor(topPixel / this.rowHeight);
            var lastRow = Math.floor(bottomPixel / this.rowHeight);

            this.ensureRowsRendered(firstRow, lastRow);
        }

        ensureRowsRendered(start: any, finish: any) {
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
        removeVirtualRows(rowsToRemove: any) {
            var _this = this;
            rowsToRemove.forEach(function (indexToRemove: any) {
                var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
                _this.eListContainer.removeChild(eRowToRemove);
                delete _this.rowsInBodyContainer[indexToRemove];
            });
        }

        insertRow(value: any, rowIndex: any) {
            var _this = this;

            var eFilterValue = this.eFilterValueTemplate.cloneNode(true);

            var valueElement = eFilterValue.querySelector(".ag-filter-value");
            if (this.cellRenderer) {
                //renderer provided, so use it
                var resultFromRenderer = this.cellRenderer({
                    value: value
                });

                if (utils.isNode(resultFromRenderer)) {
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

        onCheckboxClicked(eCheckbox: any, value: any) {
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

            this.filterChangedCallback();
        }

        onMiniFilterChanged() {
            var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
            if (miniFilterChanged) {
                this.setContainerHeight();
                this.refreshVirtualRows();
            }
        }

        refreshVirtualRows() {
            this.clearVirtualRows();
            this.drawVirtualRows();
        }

        clearVirtualRows() {
            var rowsToRemove = Object.keys(this.rowsInBodyContainer);
            this.removeVirtualRows(rowsToRemove);
        }

        onSelectAll() {
            var checked = this.eSelectAll.checked;
            if (checked) {
                this.model.selectEverything();
            } else {
                this.model.selectNothing();
            }
            this.updateAllCheckboxes(checked);
            this.filterChangedCallback();
        }

        updateAllCheckboxes(checked: any) {
            var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll("[filter-checkbox=true]");
            for (var i = 0, l = currentlyDisplayedCheckboxes.length; i < l; i++) {
                currentlyDisplayedCheckboxes[i].checked = checked;
            }
        }

        addScrollListener() {
            var _this = this;

            this.eListViewport.addEventListener("scroll", function () {
                _this.drawVirtualRows();
            });
        }

        getApi() {
            return this.api;
        }

        createApi()
        {
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
                    model.selectEverything();
                },
                isFilterActive: function () {
                    return model.isFilterActive();
                },
                selectNothing: function () {
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


// ag-grid-enterprise v4.0.7
var main_1 = require("ag-grid/main");
var setFilterModel_1 = require("./setFilterModel");
var template = '<div>' +
    '<div class="ag-filter-header-container">' +
    '<input class="ag-filter-filter" type="text" placeholder="[SEARCH...]"/>' +
    '</div>' +
    '<div class="ag-filter-header-container">' +
    '<label>' +
    '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>' +
    '([SELECT ALL])' +
    '</label>' +
    '</div>' +
    '<div class="ag-filter-list-viewport">' +
    '<div class="ag-filter-list-container">' +
    '<div id="itemForRepeat" class="ag-filter-item">' +
    '<label>' +
    '<input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>' +
    '<span class="ag-filter-value"></span>' +
    '</label>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="ag-filter-apply-panel" id="applyPanel">' +
    '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
    '</div>' +
    '</div>';
var DEFAULT_ROW_HEIGHT = 20;
var SetFilter = (function () {
    function SetFilter() {
    }
    SetFilter.prototype.init = function (params) {
        this.filterParams = params.filterParams;
        this.rowHeight = (this.filterParams && this.filterParams.cellHeight) ? this.filterParams.cellHeight : DEFAULT_ROW_HEIGHT;
        this.applyActive = this.filterParams && this.filterParams.apply === true;
        this.model = new setFilterModel_1.SetFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter);
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
    };
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    SetFilter.prototype.afterGuiAttached = function (params) {
        this.drawVirtualRows();
    };
    SetFilter.prototype.isFilterActive = function () {
        return this.model.isFilterActive();
    };
    SetFilter.prototype.doesFilterPass = function (node) {
        // if no filter, always pass
        if (this.model.isEverythingSelected()) {
            return true;
        }
        // if nothing selected in filter, always fail
        if (this.model.isNothingSelected()) {
            return false;
        }
        var value = this.valueGetter(node);
        value = main_1.Utils.makeNull(value);
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                if (this.model.isValueSelected(value[i])) {
                    return true;
                }
            }
            return false;
        }
        else {
            return this.model.isValueSelected(value);
        }
    };
    SetFilter.prototype.getGui = function () {
        return this.eGui;
    };
    SetFilter.prototype.onNewRowsLoaded = function () {
        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        var isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
        // default is reset
        this.model.refreshAfterNewRowsLoaded(keepSelection, isSelectAll);
        this.setContainerHeight();
        this.refreshVirtualRows();
    };
    SetFilter.prototype.onAnyFilterChanged = function () {
        this.model.refreshAfterAnyFilterChanged();
        this.setContainerHeight();
        this.refreshVirtualRows();
    };
    SetFilter.prototype.createTemplate = function () {
        return template
            .replace('[SELECT ALL]', this.localeTextFunc('selectAll', 'Select All'))
            .replace('[SEARCH...]', this.localeTextFunc('searchOoo', 'Search...'))
            .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
    };
    SetFilter.prototype.createGui = function () {
        var _this = this;
        this.eGui = main_1.Utils.loadTemplate(this.createTemplate());
        this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
        this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
        this.eSelectAll = this.eGui.querySelector("#selectAll");
        this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
        this.eMiniFilter = this.eGui.querySelector(".ag-filter-filter");
        this.eListContainer.style.height = (this.model.getUniqueValueCount() * this.rowHeight) + "px";
        this.setContainerHeight();
        this.eMiniFilter.value = this.model.getMiniFilter();
        main_1.Utils.addChangeListener(this.eMiniFilter, function () {
            _this.onMiniFilterChanged();
        });
        main_1.Utils.removeAllChildren(this.eListContainer);
        this.eSelectAll.onclick = this.onSelectAll.bind(this);
        if (this.model.isEverythingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = true;
        }
        else if (this.model.isNothingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = false;
        }
        else {
            this.eSelectAll.indeterminate = true;
        }
        this.setupApply();
    };
    SetFilter.prototype.setupApply = function () {
        var _this = this;
        if (this.applyActive) {
            this.eApplyButton = this.eGui.querySelector('#applyButton');
            this.eApplyButton.addEventListener('click', function () {
                _this.filterChangedCallback();
            });
        }
        else {
            main_1.Utils.removeElement(this.eGui, '#applyPanel');
        }
    };
    SetFilter.prototype.setContainerHeight = function () {
        this.eListContainer.style.height = (this.model.getDisplayedValueCount() * this.rowHeight) + "px";
    };
    SetFilter.prototype.drawVirtualRows = function () {
        var topPixel = this.eListViewport.scrollTop;
        var bottomPixel = topPixel + this.eListViewport.offsetHeight;
        var firstRow = Math.floor(topPixel / this.rowHeight);
        var lastRow = Math.floor(bottomPixel / this.rowHeight);
        this.ensureRowsRendered(firstRow, lastRow);
    };
    SetFilter.prototype.ensureRowsRendered = function (start, finish) {
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
    };
    //takes array of row id's
    SetFilter.prototype.removeVirtualRows = function (rowsToRemove) {
        var _this = this;
        rowsToRemove.forEach(function (indexToRemove) {
            var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
            _this.eListContainer.removeChild(eRowToRemove);
            delete _this.rowsInBodyContainer[indexToRemove];
        });
    };
    SetFilter.prototype.insertRow = function (value, rowIndex) {
        var _this = this;
        var eFilterValue = this.eFilterValueTemplate.cloneNode(true);
        var valueElement = eFilterValue.querySelector(".ag-filter-value");
        if (this.cellRenderer) {
            //renderer provided, so use it
            var resultFromRenderer = this.cellRenderer({
                value: value
            });
            if (main_1.Utils.isNode(resultFromRenderer)) {
                //a dom node or element was returned, so add child
                valueElement.appendChild(resultFromRenderer);
            }
            else {
                //otherwise assume it was html, so just insert
                valueElement.innerHTML = resultFromRenderer;
            }
        }
        else {
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
    };
    SetFilter.prototype.onCheckboxClicked = function (eCheckbox, value) {
        var checked = eCheckbox.checked;
        if (checked) {
            this.model.selectValue(value);
            if (this.model.isEverythingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = true;
            }
            else {
                this.eSelectAll.indeterminate = true;
            }
        }
        else {
            this.model.unselectValue(value);
            //if set is empty, nothing is selected
            if (this.model.isNothingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = false;
            }
            else {
                this.eSelectAll.indeterminate = true;
            }
        }
        this.filterChanged();
    };
    SetFilter.prototype.filterChanged = function () {
        this.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterChangedCallback();
        }
    };
    SetFilter.prototype.onMiniFilterChanged = function () {
        var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.setContainerHeight();
            this.refreshVirtualRows();
        }
    };
    SetFilter.prototype.refreshVirtualRows = function () {
        this.clearVirtualRows();
        this.drawVirtualRows();
    };
    SetFilter.prototype.clearVirtualRows = function () {
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);
        this.removeVirtualRows(rowsToRemove);
    };
    SetFilter.prototype.onSelectAll = function () {
        var checked = this.eSelectAll.checked;
        if (checked) {
            this.model.selectEverything();
        }
        else {
            this.model.selectNothing();
        }
        this.updateAllCheckboxes(checked);
        this.filterChanged();
    };
    SetFilter.prototype.updateAllCheckboxes = function (checked) {
        var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll("[filter-checkbox=true]");
        for (var i = 0, l = currentlyDisplayedCheckboxes.length; i < l; i++) {
            currentlyDisplayedCheckboxes[i].checked = checked;
        }
    };
    SetFilter.prototype.addScrollListener = function () {
        var _this = this;
        this.eListViewport.addEventListener("scroll", function () {
            _this.drawVirtualRows();
        });
    };
    SetFilter.prototype.getApi = function () {
        return this.api;
    };
    SetFilter.prototype.createApi = function () {
        var model = this.model;
        var that = this;
        this.api = {
            setMiniFilter: function (newMiniFilter) {
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
            unselectValue: function (value) {
                model.unselectValue(value);
                that.refreshVirtualRows();
            },
            selectValue: function (value) {
                model.selectValue(value);
                that.refreshVirtualRows();
            },
            isValueSelected: function (value) {
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
            getUniqueValue: function (index) {
                return model.getUniqueValue(index);
            },
            getModel: function () {
                return model.getModel();
            },
            setModel: function (dataModel) {
                model.setModel(dataModel);
                that.refreshVirtualRows();
            }
        };
    };
    return SetFilter;
})();
exports.SetFilter = SetFilter;

// ag-grid-enterprise v13.2.0
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid/main");
var setFilterModel_1 = require("./setFilterModel");
var setFilterListItem_1 = require("./setFilterListItem");
var virtualList_1 = require("../rendering/virtualList");
var SetFilter = (function (_super) {
    __extends(SetFilter, _super);
    function SetFilter() {
        var _this = _super.call(this) || this;
        _this.selected = true;
        return _this;
    }
    SetFilter.prototype.customInit = function () {
        var _this = this;
        var changeFilter = function () {
            _this.onFilterChanged();
        };
        var debounceMs = this.filterParams && this.filterParams.debounceMs != null ? this.filterParams.debounceMs : 0;
        this.debounceFilterChanged = main_1._.debounce(changeFilter, debounceMs);
        this.eCheckedIcon = main_1._.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.filterParams.column);
        this.eUncheckedIcon = main_1._.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.filterParams.column);
        this.eIndeterminateCheckedIcon = main_1._.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.filterParams.column);
    };
    SetFilter.prototype.updateCheckboxIcon = function () {
        if (this.eSelectAll.children) {
            for (var i = 0; i < this.eSelectAll.children.length; i++) {
                this.eSelectAll.removeChild(this.eSelectAll.children.item(i));
            }
        }
        if (this.eSelectAll.indeterminate) {
            this.eSelectAll.appendChild(this.eIndeterminateCheckedIcon);
        }
        else if (this.eSelectAll.checked) {
            this.eSelectAll.appendChild(this.eCheckedIcon);
        }
        else {
            this.eSelectAll.appendChild(this.eUncheckedIcon);
        }
    };
    SetFilter.prototype.initialiseFilterBodyUi = function () {
        var _this = this;
        this.virtualList = new virtualList_1.VirtualList();
        this.context.wireBean(this.virtualList);
        this.getHtmlElement().querySelector('#richList').appendChild(this.virtualList.getHtmlElement());
        if (main_1.Utils.exists(this.filterParams.cellHeight)) {
            this.virtualList.setRowHeight(this.filterParams.cellHeight);
        }
        this.virtualList.setComponentCreator(this.createSetListItem.bind(this));
        this.model = new setFilterModel_1.SetFilterModel(this.filterParams.colDef, this.filterParams.rowModel, this.filterParams.valueGetter, this.filterParams.doesRowPassOtherFilter, this.filterParams.suppressSorting);
        this.virtualList.setModel(new ModelWrapper(this.model));
        main_1._.setVisible(this.getHtmlElement().querySelector('#ag-mini-filter'), !this.filterParams.suppressMiniFilter);
        this.eMiniFilter.value = this.model.getMiniFilter();
        this.addDestroyableEventListener(this.eMiniFilter, 'input', function () { return _this.onMiniFilterChanged(); });
        this.updateCheckboxIcon();
        this.eSelectAllContainer.onclick = this.onSelectAll.bind(this);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.modelFromFloatingFilter = function (from) {
        return [from];
    };
    SetFilter.prototype.refreshFilterBodyUi = function () {
    };
    SetFilter.prototype.createSetListItem = function (value) {
        var _this = this;
        var listItem = new setFilterListItem_1.SetFilterListItem(value, this.filterParams.column);
        this.context.wireBean(listItem);
        listItem.setSelected(this.model.isValueSelected(value));
        listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_SELECTED, function () {
            _this.onItemSelected(value, listItem.isSelected());
        });
        return listItem;
    };
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    SetFilter.prototype.afterGuiAttached = function (params) {
        this.virtualList.refresh();
        this.eMiniFilter.focus();
    };
    SetFilter.prototype.isFilterActive = function () {
        return this.model.isFilterActive();
    };
    SetFilter.prototype.doesFilterPass = function (params) {
        // if no filter, always pass
        if (this.model.isEverythingSelected() && !this.filterParams.selectAllOnMiniFilter) {
            return true;
        }
        // if nothing selected in filter, always fail
        if (this.model.isNothingSelected() && !this.filterParams.selectAllOnMiniFilter) {
            return false;
        }
        var value = this.filterParams.valueGetter(params.node);
        if (this.filterParams.colDef.keyCreator) {
            value = this.filterParams.colDef.keyCreator({ value: value });
        }
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
    SetFilter.prototype.onNewRowsLoaded = function () {
        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        var isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
        // default is reset
        this.model.refreshAfterNewRowsLoaded(keepSelection, isSelectAll);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     */
    SetFilter.prototype.setFilterValues = function (options) {
        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        var isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
        this.model.setUsingProvidedSet(true);
        this.model.refreshValues(options, keepSelection, isSelectAll);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started
     * @param options The options to use.
     */
    SetFilter.prototype.resetFilterValues = function () {
        this.model.setUsingProvidedSet(false);
        this.onNewRowsLoaded();
    };
    SetFilter.prototype.onAnyFilterChanged = function () {
        this.model.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    };
    SetFilter.prototype.bodyTemplate = function () {
        var translate = this.translate.bind(this);
        return "<div>\n                    <div class=\"ag-filter-header-container\" id=\"ag-mini-filter\">\n                        <input class=\"ag-filter-filter\" type=\"text\" placeholder=\"" + translate('searchOoo') + "\"/>\n                    </div>\n                    <div class=\"ag-filter-header-container\">\n                        <label id=\"selectAllContainer\">\n                            <div id=\"selectAll\" class=\"ag-filter-checkbox\"></div>\n                            <span class=\"ag-filter-value\">(" + translate('selectAll') + ")</span>\n                        </label>\n                    </div>\n                    <div id=\"richList\" class=\"ag-set-filter-list\"></div>                    \n                </div>";
    };
    SetFilter.prototype.updateSelectAll = function () {
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
        this.updateCheckboxIcon();
    };
    SetFilter.prototype.onMiniFilterChanged = function () {
        var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.virtualList.refresh();
        }
        this.updateSelectAll();
    };
    SetFilter.prototype.onSelectAll = function () {
        this.eSelectAll.checked = !this.eSelectAll.checked;
        var checked = this.eSelectAll.checked;
        if (checked) {
            this.model.selectEverything();
        }
        else {
            this.model.selectNothing();
        }
        this.virtualList.refresh();
        this.debounceFilterChanged();
        this.updateSelectAll();
    };
    SetFilter.prototype.onItemSelected = function (value, selected) {
        if (selected) {
            this.model.selectValue(value);
        }
        else {
            this.model.unselectValue(value);
        }
        this.updateSelectAll();
        this.debounceFilterChanged();
    };
    SetFilter.prototype.setMiniFilter = function (newMiniFilter) {
        this.model.setMiniFilter(newMiniFilter);
        this.eMiniFilter.value = this.model.getMiniFilter();
    };
    SetFilter.prototype.getMiniFilter = function () {
        return this.model.getMiniFilter();
    };
    SetFilter.prototype.selectEverything = function () {
        this.model.selectEverything();
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.selectNothing = function () {
        this.model.selectNothing();
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.unselectValue = function (value) {
        this.model.unselectValue(value);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.selectValue = function (value) {
        this.model.selectValue(value);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.isValueSelected = function (value) {
        return this.model.isValueSelected(value);
    };
    SetFilter.prototype.isEverythingSelected = function () {
        return this.model.isEverythingSelected();
    };
    SetFilter.prototype.isNothingSelected = function () {
        return this.model.isNothingSelected();
    };
    SetFilter.prototype.getUniqueValueCount = function () {
        return this.model.getUniqueValueCount();
    };
    SetFilter.prototype.getUniqueValue = function (index) {
        return this.model.getUniqueValue(index);
    };
    SetFilter.prototype.serialize = function () {
        return this.model.getModel();
    };
    SetFilter.prototype.parse = function (dataModel) {
        this.model.setModel(dataModel);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.resetState = function () {
        this.setMiniFilter(null);
        this.model.setModel(null, true);
        this.selectEverything();
    };
    __decorate([
        main_1.QuerySelector('#selectAll'),
        __metadata("design:type", HTMLInputElement)
    ], SetFilter.prototype, "eSelectAll", void 0);
    __decorate([
        main_1.QuerySelector('#selectAllContainer'),
        __metadata("design:type", HTMLElement)
    ], SetFilter.prototype, "eSelectAllContainer", void 0);
    __decorate([
        main_1.QuerySelector('.ag-filter-filter'),
        __metadata("design:type", HTMLInputElement)
    ], SetFilter.prototype, "eMiniFilter", void 0);
    return SetFilter;
}(main_1.BaseFilter));
exports.SetFilter = SetFilter;
var ModelWrapper = (function () {
    function ModelWrapper(model) {
        this.model = model;
    }
    ModelWrapper.prototype.getRowCount = function () {
        return this.model.getDisplayedValueCount();
    };
    ModelWrapper.prototype.getRow = function (index) {
        return this.model.getDisplayedValue(index);
    };
    return ModelWrapper;
}());

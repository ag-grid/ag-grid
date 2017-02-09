// ag-grid-enterprise v8.0.0
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var setFilterModel_1 = require("./setFilterModel");
var setFilterListItem_1 = require("./setFilterListItem");
var virtualList_1 = require("../rendering/virtualList");
var SetFilter = (function (_super) {
    __extends(SetFilter, _super);
    function SetFilter() {
        _super.call(this);
    }
    SetFilter.prototype.postConstruct = function () {
        this.setTemplate(this.createTemplate());
        this.virtualList = new virtualList_1.VirtualList();
        this.context.wireBean(this.virtualList);
        this.getGui().querySelector('#richList').appendChild(this.virtualList.getGui());
    };
    SetFilter.prototype.init = function (params) {
        this.params = params;
        this.applyActive = this.params.apply === true;
        this.suppressSorting = this.params.suppressSorting === true;
        this.newRowsActionKeep = this.params.newRowsAction === 'keep';
        if (main_1.Utils.exists(this.params.cellHeight)) {
            this.virtualList.setRowHeight(this.params.cellHeight);
        }
        this.virtualList.setComponentCreator(this.createSetListItem.bind(this));
        this.model = new setFilterModel_1.SetFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter, this.suppressSorting);
        this.virtualList.setModel(new ModelWrapper(this.model));
        this.createGui();
    };
    SetFilter.prototype.createSetListItem = function (value) {
        var _this = this;
        var cellRenderer = this.params.cellRenderer;
        var listItem = new setFilterListItem_1.SetFilterListItem(value, cellRenderer);
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
        if (this.model.isEverythingSelected()) {
            return true;
        }
        // if nothing selected in filter, always fail
        if (this.model.isNothingSelected()) {
            return false;
        }
        var value = this.params.valueGetter(params.node);
        if (this.params.colDef.keyCreator) {
            value = this.params.colDef.keyCreator({ value: value });
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
        var keepSelection = this.params && this.params.newRowsAction === 'keep';
        var isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
        // default is reset
        this.model.refreshAfterNewRowsLoaded(keepSelection, isSelectAll);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.onAnyFilterChanged = function () {
        this.model.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    };
    SetFilter.prototype.createTemplate = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return "<div>\n                    <div class=\"ag-filter-header-container\">\n                        <input class=\"ag-filter-filter\" type=\"text\" placeholder=\"" + translate('searchOoo', 'Search...') + "\"/>\n                    </div>\n                    <div class=\"ag-filter-header-container\">\n                        <label>\n                            <input id=\"selectAll\" type=\"checkbox\" class=\"ag-filter-checkbox\"/>\n                            <span class=\"ag-filter-value\">(" + translate('selectAll', 'Select All') + ")</span>\n                        </label>\n                    </div>\n                    <div id=\"richList\" class=\"ag-set-filter-list\"></div>\n                    <div class=\"ag-filter-apply-panel\" id=\"applyPanel\">\n                        <button type=\"button\" id=\"applyButton\">" + translate('applyFilter', 'Apply Filter') + "</button>\n                    </div>\n                </div>";
    };
    SetFilter.prototype.createGui = function () {
        var _this = this;
        this.eSelectAll = this.queryForHtmlElement("#selectAll");
        this.eMiniFilter = this.queryForHtmlElement(".ag-filter-filter");
        this.eMiniFilter.value = this.model.getMiniFilter();
        this.addDestroyableEventListener(this.eMiniFilter, 'input', function () {
            _this.onMiniFilterChanged();
        });
        this.eSelectAll.onclick = this.onSelectAll.bind(this);
        this.updateSelectAll();
        this.setupApply();
        this.virtualList.refresh();
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
    };
    SetFilter.prototype.setupApply = function () {
        var _this = this;
        if (this.applyActive) {
            this.eApplyButton = this.queryForHtmlElement('#applyButton');
            this.eApplyButton.addEventListener('click', function () {
                _this.params.filterChangedCallback();
            });
        }
        else {
            main_1.Utils.removeElement(this.getGui(), '#applyPanel');
        }
    };
    SetFilter.prototype.filterChanged = function () {
        this.params.filterModifiedCallback();
        if (!this.applyActive) {
            this.params.filterChangedCallback();
        }
    };
    SetFilter.prototype.onMiniFilterChanged = function () {
        var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.virtualList.refresh();
        }
    };
    SetFilter.prototype.onSelectAll = function () {
        var checked = this.eSelectAll.checked;
        if (checked) {
            this.model.selectEverything();
        }
        else {
            this.model.selectNothing();
        }
        this.virtualList.refresh();
        this.filterChanged();
    };
    SetFilter.prototype.onItemSelected = function (value, selected) {
        if (selected) {
            this.model.selectValue(value);
        }
        else {
            this.model.unselectValue(value);
        }
        this.updateSelectAll();
        this.filterChanged();
    };
    SetFilter.prototype.setMiniFilter = function (newMiniFilter) {
        this.model.setMiniFilter(newMiniFilter);
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
    SetFilter.prototype.getModel = function () {
        return this.model.getModel();
    };
    SetFilter.prototype.setModel = function (dataModel) {
        this.model.setModel(dataModel);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], SetFilter.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], SetFilter.prototype, "context", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], SetFilter.prototype, "postConstruct", null);
    return SetFilter;
}(main_1.Component));
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

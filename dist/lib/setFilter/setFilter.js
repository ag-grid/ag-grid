// ag-grid-enterprise v8.2.0
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
        return _super.call(this) || this;
    }
    SetFilter.prototype.modelFromFloatingFilter = function (from) {
        return [from];
    };
    SetFilter.prototype.initialiseFilterBodyUi = function () {
        var _this = this;
        this.virtualList = new virtualList_1.VirtualList();
        this.context.wireBean(this.virtualList);
        this.getGui().querySelector('#richList').appendChild(this.virtualList.getGui());
        if (main_1.Utils.exists(this.filterParams.cellHeight)) {
            this.virtualList.setRowHeight(this.filterParams.cellHeight);
        }
        this.virtualList.setComponentCreator(this.createSetListItem.bind(this));
        this.model = new setFilterModel_1.SetFilterModel(this.filterParams.colDef, this.filterParams.rowModel, this.filterParams.valueGetter, this.filterParams.doesRowPassOtherFilter, this.suppressSorting);
        this.virtualList.setModel(new ModelWrapper(this.model));
        main_1._.setVisible(this.getGui().querySelector('#ag-mini-filter'), !this.filterParams.suppressMiniFilter);
        this.eMiniFilter.value = this.model.getMiniFilter();
        this.addDestroyableEventListener(this.eMiniFilter, 'input', function () { return _this.onMiniFilterChanged(); });
        this.eSelectAll.onclick = this.onSelectAll.bind(this);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.refreshFilterBodyUi = function () {
    };
    SetFilter.prototype.createSetListItem = function (value) {
        var _this = this;
        var cellRenderer = this.filterParams.cellRenderer;
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
    SetFilter.prototype.onAnyFilterChanged = function () {
        this.model.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    };
    SetFilter.prototype.bodyTemplate = function () {
        var translate = this.translate.bind(this);
        return "<div>\n                    <div class=\"ag-filter-header-container\" id=\"ag-mini-filter\">\n                        <input class=\"ag-filter-filter\" type=\"text\" placeholder=\"" + translate('searchOoo') + "\"/>\n                    </div>\n                    <div class=\"ag-filter-header-container\">\n                        <label>\n                            <input id=\"selectAll\" type=\"checkbox\" class=\"ag-filter-checkbox\"/>\n                            <span class=\"ag-filter-value\">(" + translate('selectAll') + ")</span>\n                        </label>\n                    </div>\n                    <div id=\"richList\" class=\"ag-set-filter-list\"></div>                    \n                </div>";
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
    SetFilter.prototype.onMiniFilterChanged = function () {
        var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.virtualList.refresh();
        }
        this.updateSelectAll();
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
        this.onFilterChanged();
    };
    SetFilter.prototype.onItemSelected = function (value, selected) {
        if (selected) {
            this.model.selectValue(value);
        }
        else {
            this.model.unselectValue(value);
        }
        this.updateSelectAll();
        this.onFilterChanged();
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
    SetFilter.prototype.serialize = function () {
        return this.model.getModel();
    };
    SetFilter.prototype.parse = function (dataModel) {
        this.model.setModel(dataModel);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.resetState = function () {
        this.model.setModel(null);
    };
    return SetFilter;
}(main_1.BaseFilter));
__decorate([
    main_1.QuerySelector('#selectAll'),
    __metadata("design:type", HTMLInputElement)
], SetFilter.prototype, "eSelectAll", void 0);
__decorate([
    main_1.QuerySelector('.ag-filter-filter'),
    __metadata("design:type", HTMLInputElement)
], SetFilter.prototype, "eMiniFilter", void 0);
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

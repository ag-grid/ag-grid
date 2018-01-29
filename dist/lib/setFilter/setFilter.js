// ag-grid-enterprise v16.0.1
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
var CheckboxState;
(function (CheckboxState) {
    CheckboxState[CheckboxState["CHECKED"] = 0] = "CHECKED";
    CheckboxState[CheckboxState["UNCHECKED"] = 1] = "UNCHECKED";
    CheckboxState[CheckboxState["INTERMEDIATE"] = 2] = "INTERMEDIATE";
})(CheckboxState || (CheckboxState = {}));
;
var SetFilter = (function (_super) {
    __extends(SetFilter, _super);
    function SetFilter() {
        return _super.call(this) || this;
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
        this.eIndeterminateCheckedIcon = main_1._.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, this.filterParams.column);
    };
    SetFilter.prototype.updateCheckboxIcon = function () {
        main_1._.removeAllChildren(this.eSelectAll);
        var icon;
        switch (this.selectAllState) {
            case CheckboxState.INTERMEDIATE:
                icon = this.eIndeterminateCheckedIcon;
                break;
            case CheckboxState.CHECKED:
                icon = this.eCheckedIcon;
                break;
            case CheckboxState.UNCHECKED:
                icon = this.eUncheckedIcon;
                break;
            default:// default happens when initialising for first time
                icon = this.eCheckedIcon;
                break;
        }
        this.eSelectAll.appendChild(icon);
    };
    SetFilter.prototype.setLoading = function (loading) {
        main_1._.setVisible(this.eFilterLoading, loading);
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
        this.model = new setFilterModel_1.SetFilterModel(this.filterParams.colDef, this.filterParams.rowModel, this.filterParams.valueGetter, this.filterParams.doesRowPassOtherFilter, this.filterParams.suppressSorting, function (values) { return _this.setFilterValues(values, true, false); }, this.setLoading.bind(this));
        this.virtualList.setModel(new ModelWrapper(this.model));
        main_1._.setVisible(this.getGui().querySelector('#ag-mini-filter'), !this.filterParams.suppressMiniFilter);
        this.eMiniFilter.value = this.model.getMiniFilter();
        this.addDestroyableEventListener(this.eMiniFilter, 'input', function () { return _this.onMiniFilterChanged(); });
        this.updateCheckboxIcon();
        this.addDestroyableEventListener(this.eSelectAllContainer, 'click', this.onSelectAll.bind(this));
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
        var isSelectAll = this.selectAllState === CheckboxState.CHECKED;
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
     * @param selectAll If by default all the values should be selected.
     * @param notify If we should let know the model that the values of the filter have changed
     */
    SetFilter.prototype.setFilterValues = function (options, selectAll, notify) {
        var _this = this;
        if (selectAll === void 0) { selectAll = false; }
        if (notify === void 0) { notify = true; }
        this.model.onFilterValuesReady(function () {
            var keepSelection = _this.filterParams && _this.filterParams.newRowsAction === 'keep';
            var isSelectAll = selectAll || (_this.selectAllState === CheckboxState.CHECKED);
            _this.model.setValuesType(setFilterModel_1.SetFilterModelValuesType.PROVIDED_LIST);
            _this.model.refreshValues(options, keepSelection, isSelectAll);
            _this.updateSelectAll();
            options.forEach(function (option) { return _this.model.selectValue(option); });
            _this.virtualList.refresh();
            if (notify) {
                _this.debounceFilterChanged();
            }
        });
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started
     * @param options The options to use.
     */
    SetFilter.prototype.resetFilterValues = function () {
        this.model.setValuesType(setFilterModel_1.SetFilterModelValuesType.NOT_PROVIDED);
        this.onNewRowsLoaded();
    };
    SetFilter.prototype.onAnyFilterChanged = function () {
        this.model.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    };
    SetFilter.prototype.bodyTemplate = function () {
        var translate = this.translate.bind(this);
        return "<div ref=\"ag-filter-loading\" class=\"loading-filter ag-hidden\">" + translate('loadingOoo') + "</div>\n                <div>\n                    <div class=\"ag-filter-header-container\" id=\"ag-mini-filter\">\n                        <input class=\"ag-filter-filter\" type=\"text\" placeholder=\"" + translate('searchOoo') + "\"/>\n                    </div>\n                    <div class=\"ag-filter-header-container\">\n                        <label id=\"selectAllContainer\">\n                            <div id=\"selectAll\" class=\"ag-filter-checkbox\"></div><span class=\"ag-filter-value\">(" + translate('selectAll') + ")</span>\n                        </label>\n                    </div>\n                    <div id=\"richList\" class=\"ag-set-filter-list\"></div>                    \n                </div>";
    };
    SetFilter.prototype.updateSelectAll = function () {
        if (this.model.isEverythingSelected()) {
            this.selectAllState = CheckboxState.CHECKED;
        }
        else if (this.model.isNothingSelected()) {
            this.selectAllState = CheckboxState.UNCHECKED;
        }
        else {
            this.selectAllState = CheckboxState.INTERMEDIATE;
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
    SetFilter.prototype.onSelectAll = function (event) {
        main_1._.addAgGridEventPath(event);
        if (this.selectAllState === CheckboxState.CHECKED) {
            this.selectAllState = CheckboxState.UNCHECKED;
        }
        else {
            this.selectAllState = CheckboxState.CHECKED;
        }
        this.doSelectAll();
    };
    SetFilter.prototype.doSelectAll = function () {
        var checked = this.selectAllState === CheckboxState.CHECKED;
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
    __decorate([
        main_1.RefSelector('ag-filter-loading'),
        __metadata("design:type", HTMLInputElement)
    ], SetFilter.prototype, "eFilterLoading", void 0);
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

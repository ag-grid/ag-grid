// ag-grid-enterprise v21.2.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
var ag_grid_community_1 = require("ag-grid-community");
var setValueModel_1 = require("./setValueModel");
var setFilterListItem_1 = require("./setFilterListItem");
var virtualList_1 = require("../rendering/virtualList");
var CheckboxState;
(function (CheckboxState) {
    CheckboxState[CheckboxState["CHECKED"] = 0] = "CHECKED";
    CheckboxState[CheckboxState["UNCHECKED"] = 1] = "UNCHECKED";
    CheckboxState[CheckboxState["INTERMEDIATE"] = 2] = "INTERMEDIATE";
})(CheckboxState || (CheckboxState = {}));
var SetFilter = /** @class */ (function (_super) {
    __extends(SetFilter, _super);
    function SetFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // unlike the simple filter's, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    SetFilter.prototype.updateUiVisibility = function () { };
    SetFilter.prototype.createBodyTemplate = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return "<div ref=\"ag-filter-loading\" class=\"loading-filter ag-hidden\">" + translate('loadingOoo', 'Loading...') + "</div>\n                <div>\n                    <div class=\"ag-filter-header-container\" role=\"presentation\">\n                        <div class=\"ag-input-wrapper\" id=\"ag-mini-filter\" role=\"presentation\">\n                            <input ref=\"eMiniFilter\" class=\"ag-filter-filter\" type=\"text\" placeholder=\"" + translate('searchOoo', 'Search...') + "\"/>\n                        </div>\n                        <label ref=\"eSelectAllContainer\" class=\"ag-set-filter-item\">\n                            <div ref=\"eSelectAll\" class=\"ag-filter-checkbox\"></div><span class=\"ag-filter-value\">(" + translate('selectAll', 'Select All') + ")</span>\n                        </label>\n                    </div>\n                    <div ref=\"eSetFilterList\" class=\"ag-set-filter-list\" role=\"presentation\"></div>\n                </div>";
    };
    SetFilter.prototype.resetUiToDefaults = function () {
        this.setMiniFilter(null);
        this.valueModel.setModel(null, true);
        this.selectEverything();
    };
    SetFilter.prototype.setModelIntoUi = function (model) {
        this.resetUiToDefaults();
        if (model) {
            // also supporting old filter model for backwards compatibility
            var newValues = (model instanceof Array) ? model : model.values;
            this.valueModel.setModel(newValues);
            this.updateSelectAll();
            this.virtualList.refresh();
        }
    };
    SetFilter.prototype.getModelFromUi = function () {
        var values = this.valueModel.getModel();
        if (!values) {
            return null;
        }
        if (this.gridOptionsWrapper.isEnableOldSetFilterModel()) {
            // this is a hack, it breaks casting rules, to apply with old model
            return values;
        }
        else {
            return {
                values: values,
                filterType: 'set'
            };
        }
    };
    SetFilter.prototype.areModelsEqual = function (a, b) {
        return false;
    };
    SetFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.setFilterParams = params;
        this.eCheckedIcon = ag_grid_community_1._.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.setFilterParams.column);
        this.eUncheckedIcon = ag_grid_community_1._.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.setFilterParams.column);
        this.eIndeterminateCheckedIcon = ag_grid_community_1._.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, this.setFilterParams.column);
        this.initialiseFilterBodyUi();
        var doSyncLikeExcel = params.syncValuesLikeExcel
            // sync like excel only withs with CSRM
            && this.rowModel.getType() === ag_grid_community_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE
            // sync only needed if user not providing values
            && !params.values;
        if (doSyncLikeExcel) {
            this.setupSyncValuesLikeExcel();
        }
    };
    SetFilter.prototype.resetFilterValuesAndReapplyModel = function () {
        var modelBeforeUpdate = this.getModel();
        this.resetFilterValues();
        if (modelBeforeUpdate) {
            this.setModel(modelBeforeUpdate);
        }
    };
    SetFilter.prototype.setupSyncValuesLikeExcel = function () {
        var _this = this;
        var col = this.setFilterParams.column;
        var rowDataUpdatedListener = function () {
            _this.resetFilterValuesAndReapplyModel();
        };
        var cellValueChangedListener = function (event) {
            // only interested in changes to do with this column
            if (event.column !== col) {
                return;
            }
            _this.resetFilterValuesAndReapplyModel();
        };
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_ROW_DATA_UPDATED, rowDataUpdatedListener);
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_CELL_VALUE_CHANGED, cellValueChangedListener);
    };
    SetFilter.prototype.updateCheckboxIcon = function () {
        ag_grid_community_1._.clearElement(this.eSelectAll);
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
            default: // default happens when initialising for first time
                icon = this.eCheckedIcon;
                break;
        }
        this.eSelectAll.appendChild(icon);
    };
    SetFilter.prototype.setLoading = function (loading) {
        ag_grid_community_1._.setDisplayed(this.eFilterLoading, loading);
    };
    SetFilter.prototype.initialiseFilterBodyUi = function () {
        var _this = this;
        this.virtualList = new virtualList_1.VirtualList();
        this.getContext().wireBean(this.virtualList);
        var eSetFilterList = this.getRefElement('eSetFilterList');
        if (eSetFilterList) {
            eSetFilterList.appendChild(this.virtualList.getGui());
        }
        if (ag_grid_community_1._.exists(this.setFilterParams.cellHeight)) {
            this.virtualList.setRowHeight(this.setFilterParams.cellHeight);
        }
        this.virtualList.setComponentCreator(this.createSetListItem.bind(this));
        this.valueModel = new setValueModel_1.SetValueModel(this.setFilterParams.colDef, this.setFilterParams.rowModel, this.setFilterParams.valueGetter, this.setFilterParams.doesRowPassOtherFilter, this.setFilterParams.suppressSorting, function (values, toSelect) { return _this.setFilterValues(values, toSelect ? false : true, toSelect ? true : false, toSelect); }, this.setLoading.bind(this), this.valueFormatterService, this.setFilterParams.column);
        this.virtualList.setModel(new ModelWrapper(this.valueModel));
        ag_grid_community_1._.setDisplayed(this.getGui().querySelector('#ag-mini-filter'), !this.setFilterParams.suppressMiniFilter);
        this.eMiniFilter.value = this.valueModel.getMiniFilter();
        this.addDestroyableEventListener(this.eMiniFilter, 'input', this.onMiniFilterInput.bind(this));
        this.addDestroyableEventListener(this.eMiniFilter, 'keypress', this.onMiniFilterKeyPress.bind(this));
        this.updateCheckboxIcon();
        this.addDestroyableEventListener(this.eSelectAllContainer, 'click', this.onSelectAll.bind(this));
        this.updateSelectAll();
        if (this.setFilterParams.suppressSelectAll) {
            ag_grid_community_1._.setDisplayed(this.eSelectAllContainer, false);
        }
        this.virtualList.refresh();
    };
    SetFilter.prototype.createSetListItem = function (value) {
        var _this = this;
        var listItem = new setFilterListItem_1.SetFilterListItem(value, this.setFilterParams.column);
        this.getContext().wireBean(listItem);
        listItem.setSelected(this.valueModel.isValueSelected(value));
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
    SetFilter.prototype.applyModel = function () {
        var _this = this;
        var res = _super.prototype.applyModel.call(this);
        // keep the appliedModelValuesMapped in sync with the applied model
        var appliedModel = this.getModel();
        if (appliedModel) {
            this.appliedModelValuesMapped = {};
            appliedModel.values.forEach(function (value) { return _this.appliedModelValuesMapped[value] = true; });
        }
        else {
            this.appliedModelValuesMapped = undefined;
        }
        return res;
    };
    SetFilter.prototype.doesFilterPass = function (params) {
        // should never happen, if filter model not set, then this method should never be called
        if (!this.appliedModelValuesMapped) {
            return true;
        }
        var value = this.setFilterParams.valueGetter(params.node);
        if (this.setFilterParams.colDef.keyCreator) {
            value = this.setFilterParams.colDef.keyCreator({ value: value });
        }
        value = ag_grid_community_1._.makeNull(value);
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                var valueExistsInMap = !!this.appliedModelValuesMapped[value[i]];
                if (valueExistsInMap) {
                    return true;
                }
            }
            return false;
        }
        else {
            var valueExistsInMap = !!this.appliedModelValuesMapped[value];
            return valueExistsInMap;
        }
    };
    SetFilter.prototype.onNewRowsLoaded = function () {
        var valuesType = this.valueModel.getValuesType();
        var valuesTypeProvided = valuesType === setValueModel_1.SetFilterModelValuesType.PROVIDED_CB
            || valuesType === setValueModel_1.SetFilterModelValuesType.PROVIDED_LIST;
        // if the user is providing values, and we are keeping the previous selection, then
        // loading new rows into the grid should have no impact.
        var newRowsActionKeep = this.isNewRowsActionKeep();
        if (newRowsActionKeep && valuesTypeProvided) {
            return;
        }
        var everythingSelected = !this.getModel();
        // default is reset
        this.valueModel.refreshAfterNewRowsLoaded(newRowsActionKeep, everythingSelected);
        this.updateSelectAll();
        this.virtualList.refresh();
        this.applyModel();
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     * @param selectAll If by default all the values should be selected.
     * @param notify If we should let know the model that the values of the filter have changed
     * @param toSelect The subset of options to subselect
     */
    SetFilter.prototype.setFilterValues = function (options, selectAll, notify, toSelect) {
        var _this = this;
        if (selectAll === void 0) { selectAll = false; }
        if (notify === void 0) { notify = true; }
        this.valueModel.onFilterValuesReady(function () {
            var keepSelection = _this.setFilterParams && _this.setFilterParams.newRowsAction === 'keep';
            _this.valueModel.setValuesType(setValueModel_1.SetFilterModelValuesType.PROVIDED_LIST);
            _this.valueModel.refreshValues(options, keepSelection, selectAll);
            _this.updateSelectAll();
            var actualToSelect = toSelect ? toSelect : options;
            actualToSelect.forEach(function (option) { return _this.valueModel.selectValue(option); });
            _this.virtualList.refresh();
            if (notify) {
                // this.onUiChangedListener(true);
                _this.onUiChanged();
            }
        });
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started
     * @param options The options to use.
     */
    SetFilter.prototype.resetFilterValues = function () {
        this.valueModel.setValuesType(setValueModel_1.SetFilterModelValuesType.NOT_PROVIDED);
        this.onNewRowsLoaded();
    };
    SetFilter.prototype.onAnyFilterChanged = function () {
        this.valueModel.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    };
    SetFilter.prototype.updateSelectAll = function () {
        if (this.valueModel.isEverythingSelected()) {
            this.selectAllState = CheckboxState.CHECKED;
        }
        else if (this.valueModel.isNothingSelected()) {
            this.selectAllState = CheckboxState.UNCHECKED;
        }
        else {
            this.selectAllState = CheckboxState.INTERMEDIATE;
        }
        this.updateCheckboxIcon();
    };
    SetFilter.prototype.onMiniFilterKeyPress = function (e) {
        if (ag_grid_community_1._.isKeyPressed(e, ag_grid_community_1.Constants.KEY_ENTER)) {
            this.onEnterKeyOnMiniFilter();
        }
    };
    SetFilter.prototype.onEnterKeyOnMiniFilter = function () {
        this.valueModel.selectAllFromMiniFilter();
        this.virtualList.refresh();
        this.updateSelectAll();
        this.onUiChanged();
    };
    SetFilter.prototype.onMiniFilterInput = function () {
        var miniFilterChanged = this.valueModel.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.virtualList.refresh();
        }
        this.updateSelectAll();
    };
    SetFilter.prototype.onSelectAll = function (event) {
        event.preventDefault();
        ag_grid_community_1._.addAgGridEventPath(event);
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
            this.valueModel.selectAllUsingMiniFilter();
        }
        else {
            this.valueModel.selectNothingUsingMiniFilter();
        }
        this.virtualList.refresh();
        this.onUiChanged();
        this.updateSelectAll();
    };
    SetFilter.prototype.onItemSelected = function (value, selected) {
        if (selected) {
            this.valueModel.selectValue(value);
        }
        else {
            this.valueModel.unselectValue(value);
        }
        this.updateSelectAll();
        this.onUiChanged();
    };
    SetFilter.prototype.setMiniFilter = function (newMiniFilter) {
        this.valueModel.setMiniFilter(newMiniFilter);
        this.eMiniFilter.value = this.valueModel.getMiniFilter();
    };
    SetFilter.prototype.getMiniFilter = function () {
        return this.valueModel.getMiniFilter();
    };
    SetFilter.prototype.selectEverything = function () {
        this.valueModel.selectAllUsingMiniFilter();
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.selectNothing = function () {
        this.valueModel.selectNothingUsingMiniFilter();
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.unselectValue = function (value) {
        this.valueModel.unselectValue(value);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.selectValue = function (value) {
        this.valueModel.selectValue(value);
        this.updateSelectAll();
        this.virtualList.refresh();
    };
    SetFilter.prototype.isValueSelected = function (value) {
        return this.valueModel.isValueSelected(value);
    };
    SetFilter.prototype.isEverythingSelected = function () {
        return this.valueModel.isEverythingSelected();
    };
    SetFilter.prototype.isNothingSelected = function () {
        return this.valueModel.isNothingSelected();
    };
    SetFilter.prototype.getUniqueValueCount = function () {
        return this.valueModel.getUniqueValueCount();
    };
    SetFilter.prototype.getUniqueValue = function (index) {
        return this.valueModel.getUniqueValue(index);
    };
    __decorate([
        ag_grid_community_1.RefSelector('eSelectAll'),
        __metadata("design:type", HTMLInputElement)
    ], SetFilter.prototype, "eSelectAll", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eSelectAllContainer'),
        __metadata("design:type", HTMLElement)
    ], SetFilter.prototype, "eSelectAllContainer", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eMiniFilter'),
        __metadata("design:type", HTMLInputElement)
    ], SetFilter.prototype, "eMiniFilter", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('ag-filter-loading'),
        __metadata("design:type", HTMLInputElement)
    ], SetFilter.prototype, "eFilterLoading", void 0);
    __decorate([
        ag_grid_community_1.Autowired('valueFormatterService'),
        __metadata("design:type", ag_grid_community_1.ValueFormatterService)
    ], SetFilter.prototype, "valueFormatterService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], SetFilter.prototype, "eventService", void 0);
    return SetFilter;
}(ag_grid_community_1.ProvidedFilter));
exports.SetFilter = SetFilter;
var ModelWrapper = /** @class */ (function () {
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

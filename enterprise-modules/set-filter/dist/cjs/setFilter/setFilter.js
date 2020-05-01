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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var setValueModel_1 = require("./setValueModel");
var setFilterListItem_1 = require("./setFilterListItem");
var SetFilter = /** @class */ (function (_super) {
    __extends(SetFilter, _super);
    function SetFilter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // To make the filtering super fast, we store the values in an object, and check for the boolean value.
        // Although Set would be a more natural choice of data structure, its performance across browsers is
        // significantly worse than using an object: https://jsbench.me/hdk91jbw1h/
        _this.appliedModelValues = null;
        return _this;
    }
    // unlike the simple filters, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    SetFilter.prototype.updateUiVisibility = function () { };
    SetFilter.prototype.createBodyTemplate = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return /* html */ "\n            <div ref=\"eFilterLoading\" class=\"ag-filter-loading ag-hidden\">" + translate('loadingOoo', 'Loading...') + "</div>\n            <div>\n                <div class=\"ag-filter-header-container\" role=\"presentation\">\n                    <ag-input-text-field class=\"ag-mini-filter\" ref=\"eMiniFilter\"></ag-input-text-field>\n                    <label ref=\"eSelectAllContainer\" class=\"ag-set-filter-item ag-set-filter-select-all\">\n                        <ag-checkbox ref=\"eSelectAll\" class=\"ag-set-filter-item-checkbox\"></ag-checkbox><span class=\"ag-set-filter-item-value\">(" + translate('selectAll', 'Select All') + ")</span>\n                    </label>\n                </div>\n                <div ref=\"eSetFilterList\" class=\"ag-set-filter-list\" role=\"presentation\"></div>\n            </div>";
    };
    SetFilter.prototype.getCssIdentifier = function () {
        return 'set-filter';
    };
    SetFilter.prototype.resetUiToDefaults = function () {
        this.setMiniFilter(null);
        this.selectEverything();
    };
    SetFilter.prototype.setModelIntoUi = function (model) {
        this.resetUiToDefaults();
        if (!model) {
            return;
        }
        if (model instanceof Array) {
            var message_1 = 'ag-Grid: The Set Filter Model is no longer an array and models as arrays are ' +
                'deprecated. Please check the docs on what the set filter model looks like. Future versions of ' +
                'ag-Grid will have the array version of the model removed.';
            core_1._.doOnce(function () { return console.warn(message_1); }, 'setFilter.modelAsArray');
        }
        // also supporting old filter model for backwards compatibility
        var newValues = model instanceof Array ? model : model.values;
        this.valueModel.setModel(newValues);
        this.refresh();
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
        return { values: values, filterType: 'set' };
    };
    SetFilter.prototype.getValueModel = function () {
        return this.valueModel;
    };
    SetFilter.prototype.areModelsEqual = function (a, b) {
        // both are missing
        if (a == null && b == null) {
            return true;
        }
        return a != null && b != null && core_1._.areEqual(a.values, b.values);
    };
    SetFilter.prototype.setParams = function (params) {
        var _this = this;
        _super.prototype.setParams.call(this, params);
        this.checkSetFilterDeprecatedParams(params);
        this.setFilterParams = params;
        this.valueModel = new setValueModel_1.SetValueModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter, params.suppressSorting, function (loading) { return _this.setLoading(loading); }, this.valueFormatterService, params.column);
        this.initialiseFilterBodyUi();
        this.valueModel.onFilterValuesReady(function () { return _this.refresh(); });
        var syncValuesAfterDataChange = this.rowModel.getType() === core_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE &&
            !params.values &&
            !params.suppressSyncValuesAfterDataChange;
        if (syncValuesAfterDataChange) {
            this.addEventListenersForDataChanges();
        }
    };
    SetFilter.prototype.checkSetFilterDeprecatedParams = function (params) {
        if (params.syncValuesLikeExcel) {
            var message_2 = 'ag-Grid: since version 22.x, the Set Filter param syncValuesLikeExcel is no longer' +
                ' used as this is the default behaviour. To turn this default behaviour off, use the' +
                ' param suppressSyncValuesAfterDataChange';
            core_1._.doOnce(function () { return console.warn(message_2); }, 'syncValuesLikeExcel deprecated');
        }
        if (params.selectAllOnMiniFilter) {
            var message_3 = 'ag-Grid: since version 22.x, the Set Filter param selectAllOnMiniFilter is no longer' +
                ' used as this is the default behaviour.';
            core_1._.doOnce(function () { return console.warn(message_3); }, 'selectAllOnMiniFilter deprecated');
        }
        if (params.suppressSyncValuesAfterDataChange) {
            var message_4 = 'ag-Grid: since version 23.1, the Set Filter param suppressSyncValuesAfterDataChange has' +
                ' been deprecated and will be removed in a future major release.';
            core_1._.doOnce(function () { return console.warn(message_4); }, 'suppressSyncValuesAfterDataChange deprecated');
        }
        if (params.suppressRemoveEntries) {
            var message_5 = 'ag-Grid: since version 23.1, the Set Filter param suppressRemoveEntries has' +
                ' been deprecated and will be removed in a future major release.';
            core_1._.doOnce(function () { return console.warn(message_5); }, 'suppressRemoveEntries deprecated');
        }
    };
    SetFilter.prototype.addEventListenersForDataChanges = function () {
        var _this = this;
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_ROW_DATA_UPDATED, function () { return _this.syncValuesAfterDataChange(); });
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_CELL_VALUE_CHANGED, function (event) {
            // only interested in changes to do with this column
            if (event.column !== _this.setFilterParams.column) {
                return;
            }
            _this.syncValuesAfterDataChange();
        });
    };
    /** Called when the data in the grid changes, to prompt the set filter values to be updated. */
    SetFilter.prototype.syncValuesAfterDataChange = function (keepSelection) {
        if (keepSelection === void 0) { keepSelection = true; }
        this.valueModel.refetchValues(keepSelection);
        this.refresh();
        this.onBtApply(false, true);
    };
    SetFilter.prototype.updateCheckboxIcon = function () {
        this.eSelectAll.setValue(this.selectAllState);
    };
    SetFilter.prototype.setLoading = function (loading) {
        core_1._.setDisplayed(this.eFilterLoading, loading);
    };
    SetFilter.prototype.initialiseFilterBodyUi = function () {
        this.initVirtualList();
        this.initMiniFilter();
        this.initSelectAll();
    };
    SetFilter.prototype.initVirtualList = function () {
        var _this = this;
        var virtualList = this.virtualList = this.wireBean(new core_1.VirtualList('filter'));
        var eSetFilterList = this.getRefElement('eSetFilterList');
        if (eSetFilterList) {
            eSetFilterList.appendChild(virtualList.getGui());
        }
        var cellHeight = this.setFilterParams.cellHeight;
        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }
        virtualList.setComponentCreator(function (value) { return _this.createSetListItem(value); });
        virtualList.setModel(new ModelWrapper(this.valueModel));
    };
    SetFilter.prototype.createSetListItem = function (value) {
        var _this = this;
        var listItem = this.wireBean(new setFilterListItem_1.SetFilterListItem(value, this.setFilterParams));
        var selected = this.valueModel.isValueSelected(value);
        listItem.setSelected(selected);
        listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_SELECTED, function () { return _this.onItemSelected(value, listItem.isSelected()); });
        return listItem;
    };
    SetFilter.prototype.initMiniFilter = function () {
        var _this = this;
        var eMiniFilter = this.eMiniFilter;
        core_1._.setDisplayed(eMiniFilter.getGui(), !this.setFilterParams.suppressMiniFilter);
        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(function () { return _this.onMiniFilterInput(); });
        this.addDestroyableEventListener(eMiniFilter.getInputElement(), 'keypress', function (e) { return _this.onMiniFilterKeyPress(e); });
    };
    SetFilter.prototype.initSelectAll = function () {
        var _this = this;
        this.updateCheckboxIcon();
        var eSelectAllContainer = this.getRefElement('eSelectAllContainer');
        if (this.setFilterParams.suppressSelectAll) {
            core_1._.setDisplayed(eSelectAllContainer, false);
        }
        else {
            this.addDestroyableEventListener(eSelectAllContainer, 'click', function (e) { return _this.onSelectAll(e); });
        }
        this.addDestroyableEventListener(this.eSelectAll.getInputElement(), 'keydown', function (e) {
            if (e.keyCode === core_1.Constants.KEY_SPACE) {
                e.preventDefault();
                _this.onSelectAll(e);
            }
        });
    };
    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    SetFilter.prototype.afterGuiAttached = function (params) {
        _super.prototype.afterGuiAttached.call(this, params);
        var _a = this, virtualList = _a.virtualList, eMiniFilter = _a.eMiniFilter;
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        virtualList.refresh();
        eMiniFilter.setInputPlaceholder(translate('searchOoo', 'Search...'));
        eMiniFilter.getFocusableElement().focus();
    };
    SetFilter.prototype.applyModel = function () {
        var _this = this;
        var result = _super.prototype.applyModel.call(this);
        // keep the appliedModelValuesMapped in sync with the applied model
        var appliedModel = this.getModel();
        if (appliedModel) {
            this.appliedModelValues = {};
            core_1._.forEach(appliedModel.values, function (value) { return _this.appliedModelValues[value] = true; });
        }
        else {
            this.appliedModelValues = null;
        }
        return result;
    };
    SetFilter.prototype.doesFilterPass = function (params) {
        var _this = this;
        if (this.appliedModelValues == null) {
            return true;
        }
        var _a = this.setFilterParams, valueGetter = _a.valueGetter, keyCreator = _a.colDef.keyCreator;
        var value = valueGetter(params.node);
        if (keyCreator) {
            value = keyCreator({ value: value });
        }
        value = core_1._.makeNull(value);
        if (Array.isArray(value)) {
            return core_1._.some(value, function (v) { return _this.appliedModelValues[core_1._.makeNull(v)] === true; });
        }
        // Comparing against a value performs better than just checking for undefined
        // https://jsbench.me/hdk91jbw1h/
        return this.appliedModelValues[value] === true;
    };
    SetFilter.prototype.onNewRowsLoaded = function () {
        var valuesType = this.valueModel.getValuesType();
        var valuesTypeProvided = valuesType === setValueModel_1.SetFilterModelValuesType.PROVIDED_CALLBACK ||
            valuesType === setValueModel_1.SetFilterModelValuesType.PROVIDED_LIST;
        // if the user is providing values, and we are keeping the previous selection, then
        // loading new rows into the grid should have no impact.
        var keepSelection = this.isNewRowsActionKeep();
        if (keepSelection && valuesTypeProvided) {
            return;
        }
        this.syncValuesAfterDataChange(keepSelection);
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
    SetFilter.prototype.setFilterValues = function (options) {
        var _this = this;
        this.valueModel.overrideValues(options, this.isNewRowsActionKeep());
        this.valueModel.onFilterValuesReady(function () {
            _this.refresh();
            _this.onUiChanged();
        });
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    SetFilter.prototype.resetFilterValues = function () {
        this.valueModel.setValuesType(setValueModel_1.SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES);
        this.onNewRowsLoaded();
    };
    SetFilter.prototype.onAnyFilterChanged = function () {
        this.valueModel.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    };
    SetFilter.prototype.updateSelectAll = function () {
        if (this.valueModel.isEverythingSelected()) {
            this.selectAllState = true;
        }
        else if (this.valueModel.isNothingSelected()) {
            this.selectAllState = false;
        }
        else {
            this.selectAllState = undefined;
        }
        this.updateCheckboxIcon();
    };
    SetFilter.prototype.onMiniFilterKeyPress = function (e) {
        if (core_1._.isKeyPressed(e, core_1.Constants.KEY_ENTER)) {
            this.valueModel.selectAll(true);
            this.refresh();
            this.onUiChanged(true);
        }
    };
    SetFilter.prototype.onMiniFilterInput = function () {
        if (this.valueModel.setMiniFilter(this.eMiniFilter.getValue())) {
            this.virtualList.refresh();
        }
        this.updateSelectAll();
    };
    SetFilter.prototype.onSelectAll = function (event) {
        event.preventDefault();
        core_1._.addAgGridEventPath(event);
        this.selectAllState = !this.selectAllState;
        if (this.selectAllState) {
            this.valueModel.selectAll();
        }
        else {
            this.valueModel.selectNothing();
        }
        this.refresh();
        this.onUiChanged();
    };
    SetFilter.prototype.onItemSelected = function (value, selected) {
        if (selected) {
            this.valueModel.selectValue(value);
        }
        else {
            this.valueModel.deselectValue(value);
        }
        this.updateSelectAll();
        this.onUiChanged();
    };
    SetFilter.prototype.setMiniFilter = function (newMiniFilter) {
        this.valueModel.setMiniFilter(newMiniFilter);
        this.eMiniFilter.setValue(this.valueModel.getMiniFilter());
    };
    SetFilter.prototype.getMiniFilter = function () {
        return this.valueModel.getMiniFilter();
    };
    SetFilter.prototype.selectEverything = function () {
        this.valueModel.selectAll();
        this.refresh();
    };
    SetFilter.prototype.selectNothing = function () {
        this.valueModel.selectNothing();
        this.refresh();
    };
    SetFilter.prototype.unselectValue = function (value) {
        this.valueModel.deselectValue(value);
        this.refresh();
    };
    SetFilter.prototype.selectValue = function (value) {
        this.valueModel.selectValue(value);
        this.refresh();
    };
    SetFilter.prototype.refresh = function () {
        this.virtualList.refresh();
        this.updateSelectAll();
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
    SetFilter.prototype.refreshVirtualList = function () {
        this.virtualList.refresh();
    };
    __decorate([
        core_1.RefSelector('eSelectAll')
    ], SetFilter.prototype, "eSelectAll", void 0);
    __decorate([
        core_1.RefSelector('eMiniFilter')
    ], SetFilter.prototype, "eMiniFilter", void 0);
    __decorate([
        core_1.RefSelector('eFilterLoading')
    ], SetFilter.prototype, "eFilterLoading", void 0);
    __decorate([
        core_1.Autowired('valueFormatterService')
    ], SetFilter.prototype, "valueFormatterService", void 0);
    __decorate([
        core_1.Autowired('eventService')
    ], SetFilter.prototype, "eventService", void 0);
    return SetFilter;
}(core_1.ProvidedFilter));
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
//# sourceMappingURL=setFilter.js.map
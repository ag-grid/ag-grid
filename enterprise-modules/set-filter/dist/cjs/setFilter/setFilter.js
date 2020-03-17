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
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // unlike the simple filter's, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    SetFilter.prototype.updateUiVisibility = function () { };
    SetFilter.prototype.createBodyTemplate = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return "<div ref=\"eFilterLoading\" class=\"ag-filter-loading ag-hidden\">" + translate('loadingOoo', 'Loading...') + "</div>\n                <div>\n                    <div class=\"ag-filter-header-container\" role=\"presentation\">\n                        <ag-input-text-field class=\"ag-mini-filter\" ref=\"eMiniFilter\"></ag-input-text-field>\n                        <label ref=\"eSelectAllContainer\" class=\"ag-set-filter-item ag-set-filter-select-all\">\n                            <ag-checkbox ref=\"eSelectAll\" class=\"ag-set-filter-item-checkbox\"></ag-checkbox><span class=\"ag-set-filter-item-value\">(" + translate('selectAll', 'Select All') + ")</span>\n                        </label>\n                    </div>\n                    <div ref=\"eSetFilterList\" class=\"ag-set-filter-list\" role=\"presentation\"></div>\n                </div>";
    };
    SetFilter.prototype.getCssIdentifier = function () {
        return 'set-filter';
    };
    SetFilter.prototype.resetUiToDefaults = function () {
        this.setMiniFilter(null);
        this.valueModel.setModel(null, true);
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
        var newValues = (model instanceof Array) ? model : model.values;
        this.valueModel.setModel(newValues);
        this.updateSelectAll();
        this.virtualList.refresh();
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
        if (!a && !b) {
            return true;
        }
        // one is missing, other present
        if ((!a && b) || (a && !b)) {
            return false;
        }
        // both present, so compare
        // if different sizes, they are different
        if (a.values.length != b.values.length) {
            return false;
        }
        // now check each one value by value
        for (var i = 0; i < a.values.length; i++) {
            if (a.values[i] !== b.values[i]) {
                return false;
            }
        }
        // got this far means value lists are identical
        return true;
    };
    SetFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.checkSetFilterDeprecatedParams(params);
        this.setFilterParams = params;
        this.initialiseFilterBodyUi();
        var syncValuesAfterDataChange = !params.suppressSyncValuesAfterDataChange &&
            // sync values only with CSRM
            this.rowModel.getType() === core_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE &&
            // sync only needed if user not providing values
            !params.values;
        if (syncValuesAfterDataChange) {
            this.setupSyncValuesAfterDataChange();
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
    };
    // gets called with change to data values, thus need to update the values available for selection
    // in the set filter.
    SetFilter.prototype.syncValuesAfterDataChange = function () {
        var everythingSelected = !this.getModel();
        this.valueModel.refreshAfterNewRowsLoaded(true, everythingSelected);
        this.updateSelectAll();
        this.virtualList.refresh();
        this.onBtApply(false, true);
    };
    // this keeps the filter up to date with changes in the row data
    SetFilter.prototype.setupSyncValuesAfterDataChange = function () {
        var _this = this;
        // add listener for when data is changed via transaction update (includes delta row mode
        // as this uses transaction updates)
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_ROW_DATA_UPDATED, this.syncValuesAfterDataChange.bind(this));
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_CELL_VALUE_CHANGED, function (event) {
            // only interested in changes to do with this column
            if (event.column !== _this.setFilterParams.column) {
                return;
            }
            _this.syncValuesAfterDataChange();
        });
    };
    SetFilter.prototype.updateCheckboxIcon = function () {
        this.eSelectAll.setValue(this.selectAllState);
    };
    SetFilter.prototype.setLoading = function (loading) {
        core_1._.setDisplayed(this.eFilterLoading, loading);
    };
    SetFilter.prototype.initialiseFilterBodyUi = function () {
        var _this = this;
        this.virtualList = new core_1.VirtualList('filter');
        this.getContext().wireBean(this.virtualList);
        var eSetFilterList = this.getRefElement('eSetFilterList');
        if (eSetFilterList) {
            eSetFilterList.appendChild(this.virtualList.getGui());
        }
        if (core_1._.exists(this.setFilterParams.cellHeight)) {
            this.virtualList.setRowHeight(this.setFilterParams.cellHeight);
        }
        this.virtualList.setComponentCreator(this.createSetListItem.bind(this));
        this.valueModel = new setValueModel_1.SetValueModel(this.setFilterParams.colDef, this.setFilterParams.rowModel, this.setFilterParams.valueGetter, this.setFilterParams.doesRowPassOtherFilter, this.setFilterParams.suppressSorting, function (values, toSelect) { return _this.setFilterValues(values, toSelect ? false : true, toSelect ? true : false, toSelect); }, this.setLoading.bind(this), this.valueFormatterService, this.setFilterParams.column);
        this.virtualList.setModel(new ModelWrapper(this.valueModel));
        core_1._.setDisplayed(this.eMiniFilter.getGui(), !this.setFilterParams.suppressMiniFilter);
        this.eMiniFilter.setValue(this.valueModel.getMiniFilter());
        this.eMiniFilter.onValueChange(function () { return _this.onMiniFilterInput(); });
        this.addDestroyableEventListener(this.eMiniFilter.getInputElement(), 'keypress', this.onMiniFilterKeyPress.bind(this));
        this.updateCheckboxIcon();
        this.addDestroyableEventListener(this.eSelectAllContainer, 'click', this.onSelectAll.bind(this));
        this.updateSelectAll();
        if (this.setFilterParams.suppressSelectAll) {
            core_1._.setDisplayed(this.eSelectAllContainer, false);
        }
        this.addDestroyableEventListener(this.eSelectAll.getInputElement(), 'keydown', function (e) {
            if (e.keyCode === core_1.Constants.KEY_SPACE) {
                e.preventDefault();
                _this.onSelectAll(e);
            }
        });
        this.virtualList.refresh();
    };
    SetFilter.prototype.createSetListItem = function (value) {
        var _this = this;
        var listItem = new setFilterListItem_1.SetFilterListItem(value, this.setFilterParams.column);
        this.getContext().wireBean(listItem);
        var selected = this.valueModel.isValueSelected(value);
        listItem.setSelected(selected);
        listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_SELECTED, function () {
            _this.onItemSelected(value, listItem.isSelected());
        });
        return listItem;
    };
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    SetFilter.prototype.afterGuiAttached = function (params) {
        var _a = this, virtualList = _a.virtualList, eMiniFilter = _a.eMiniFilter;
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        virtualList.refresh();
        eMiniFilter.setInputPlaceholder(translate('searchOoo', 'Search...'));
        eMiniFilter.getFocusableElement().focus();
    };
    SetFilter.prototype.refreshVirtualList = function () {
        this.virtualList.refresh();
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
        value = core_1._.makeNull(value);
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                var valueExistsInMap = !!this.appliedModelValuesMapped[value[i]];
                if (valueExistsInMap) {
                    return true;
                }
            }
            return false;
        }
        return !!this.appliedModelValuesMapped[value];
    };
    SetFilter.prototype.onNewRowsLoaded = function () {
        var valuesType = this.valueModel.getValuesType();
        var valuesTypeProvided = valuesType === setValueModel_1.SetFilterModelValuesType.PROVIDED_CB ||
            valuesType === setValueModel_1.SetFilterModelValuesType.PROVIDED_LIST;
        // if the user is providing values, and we are keeping the previous selection, then
        // loading new rows into the grid should have no impact.
        var keepSelection = this.isNewRowsActionKeep();
        if (keepSelection && valuesTypeProvided) {
            return;
        }
        var everythingSelected = !this.getModel();
        // default is reset
        this.valueModel.refreshAfterNewRowsLoaded(keepSelection, everythingSelected);
        this.updateSelectAll();
        this.virtualList.refresh();
        this.onBtApply(false, true);
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
            this.onEnterKeyOnMiniFilter();
        }
    };
    SetFilter.prototype.onEnterKeyOnMiniFilter = function () {
        this.valueModel.selectAllFromMiniFilter();
        this.virtualList.refresh();
        this.updateSelectAll();
        this.onUiChanged(true);
    };
    SetFilter.prototype.onMiniFilterInput = function () {
        var miniFilterChanged = this.valueModel.setMiniFilter(this.eMiniFilter.getValue());
        if (miniFilterChanged) {
            this.virtualList.refresh();
        }
        this.updateSelectAll();
    };
    SetFilter.prototype.onSelectAll = function (event) {
        event.preventDefault();
        core_1._.addAgGridEventPath(event);
        if (this.selectAllState === true) {
            this.selectAllState = false;
        }
        else {
            this.selectAllState = true;
        }
        this.doSelectAll();
    };
    SetFilter.prototype.doSelectAll = function () {
        var checked = this.selectAllState === true;
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
        this.eMiniFilter.setValue(this.valueModel.getMiniFilter());
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
        core_1.RefSelector('eSelectAll')
    ], SetFilter.prototype, "eSelectAll", void 0);
    __decorate([
        core_1.RefSelector('eSelectAllContainer')
    ], SetFilter.prototype, "eSelectAllContainer", void 0);
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